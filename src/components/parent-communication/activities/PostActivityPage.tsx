'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Bell,
  ImagePlus,
  Megaphone,
  MessageSquare,
  Mic,
  Search,
  Send,
  Settings2,
  Sparkles,
  UserRound,
  Video,
} from 'lucide-react';
import {
  ACTIVITY_ICON_MAP,
  type ActivityCardOption,
} from '@/components/parent-communication/activities/ActivitySelector';
import { AttachmentUploader } from '@/components/parent-communication/activities/AttachmentUploader';
import { VoiceRecorder } from '@/components/parent-communication/activities/VoiceRecorder';
import {
  SearchableMultiSelect,
  type SearchableOption,
} from '@/components/parent-communication/activities/SearchableMultiSelect';
import { parseYoutubeVideoId } from '@/components/parent-communication/activities/YoutubePreview';
import { DynamicActivityFields } from '@/components/parent-communication/activities/DynamicActivityFields';
import { SelectStudentsPanel } from '@/components/parent-communication/activities/SelectStudentsPanel';
import {
  listPostableActivities,
  loadActivityGeneralSettings,
  getActivityDefinitionById,
} from '@/lib/parent-communication/activityDefinitionsStore';
import { publishParentTimelinePost } from '@/lib/parent/parentTimelineStore';
import { publishCenterActivityPost, getActivityPostById, updateCenterActivityPost } from '@/lib/parent-communication/activitiesPostsStore';
import type { ActivityDefinition } from '@/types/activityDefinition';
import {
  loadStudents,
  roomName,
} from '@/lib/center-management/studentsStore';
import { loadStaff } from '@/lib/center-management/staffStore';
import { loadLabels } from '@/lib/center-management/labelsStore';
import {
  dateInputValue,
  ensureTodayDemoAttendance,
} from '@/lib/center-management/attendanceStore';
import type { Student } from '@/lib/center-management/types';
import type {
  ActivityAttachment,
  ActivityCategoryName,
  ActivityPost,
  PostingType,
  VoiceNoteData,
  YoutubePreviewData,
} from '@/types/activity';
import './post-activity-page.css';
import '@/components/parent-communication/activities/activities.css';

const ease = [0.22, 1, 0.36, 1] as const;
const CATEGORIES: Array<'All' | ActivityCategoryName> = [
  'All',
  'Communication',
  'Care & Health',
  'Learning & Development',
  'Creative & Play',
];

type Phase = 'select' | 'compose';

function defToOption(def: ActivityDefinition): ActivityCardOption {
  return {
    id: def.id,
    name: def.name,
    category: def.category,
    iconName: def.icon,
    color: def.color,
    bgColor: def.bgColor,
  };
}

function postToOption(post: ActivityPost): ActivityCardOption {
  const def = getActivityDefinitionById(post.activityTypeId);
  if (def) return defToOption(def);
  return {
    id: post.activityTypeId,
    name: post.activityTypeName,
    category: post.category,
    iconName: post.activityIcon,
    color: '#5D5FEF',
    bgColor: '#E8F2FF',
  };
}

function todayIso() {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function PostActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const editId = searchParams.get('editId');
  const isEditing = Boolean(editId);
  const returnTo =
    searchParams.get('returnTo') ||
    (studentId
      ? `/center-management/students/${studentId}`
      : '/parent-communication/activities');

  const contextStudent = useMemo(() => {
    if (!studentId) return null;
    const found = loadStudents().find((s) => s.id === studentId);
    if (!found) return null;
    const room = found.roomIds[0] ? roomName(found.roomIds[0]) : undefined;
    return {
      id: found.id,
      name: found.name,
      room: room && room !== '—' ? room : undefined,
    };
  }, [studentId]);

  const [definitions, setDefinitions] = useState<ActivityDefinition[]>([]);
  const [defaultCheckedIn, setDefaultCheckedIn] = useState(false);
  const [ignoreRoomWhenCheckedIn, setIgnoreRoomWhenCheckedIn] = useState(false);
  const options = useMemo(() => definitions.map(defToOption), [definitions]);
  const [phase, setPhase] = useState<Phase>('select');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [selected, setSelected] = useState<ActivityCardOption | null>(null);
  const [selectedDef, setSelectedDef] = useState<ActivityDefinition | null>(null);
  const [fieldValues, setFieldValues] = useState<
    Record<string, string | string[] | boolean>
  >({});
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [postingType, setPostingType] = useState<PostingType>('post_now');
  const [scheduleDate, setScheduleDate] = useState(todayIso);
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [notifyParents, setNotifyParents] = useState(true);
  const [attachments, setAttachments] = useState<ActivityAttachment[]>([]);
  const [voiceNote, setVoiceNote] = useState<VoiceNoteData | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubePreview, setYoutubePreview] = useState<YoutubePreviewData | null>(null);
  const [notifyStaffIds, setNotifyStaffIds] = useState<string[]>([]);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [staffOnly, setStaffOnly] = useState(false);
  const [enableComments, setEnableComments] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [staffOptions, setStaffOptions] = useState<SearchableOption[]>([]);
  const [labelOptions, setLabelOptions] = useState<SearchableOption[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [editLoaded, setEditLoaded] = useState(false);

  useEffect(() => {
    const staff = loadStaff()
      .filter((s) => s.status === 'Active')
      .map((s) => ({
        id: s.id,
        label: s.name,
        meta: s.role,
      }));
    setStaffOptions(staff);

    const labels = loadLabels()
      .filter((l) => l.status === 'Active' && l.feature === 'Activity')
      .map((l) => ({ id: l.id, label: l.name, meta: l.feature }));
    setLabelOptions(labels);

    const today = dateInputValue();
    const seeded = ensureTodayDemoAttendance(loadStudents(), today);
    setAllStudents(seeded);

    const defs = listPostableActivities();
    setDefinitions(defs);
    const general = loadActivityGeneralSettings();
    setDefaultCheckedIn(general.checkedInOnly);
    setIgnoreRoomWhenCheckedIn(general.allCheckedInIgnoreRoom);

    const preselectId = searchParams.get('activityId');
    if (preselectId && !editId) {
      const def = getActivityDefinitionById(preselectId);
      if (def?.active) {
        setSelected(defToOption(def));
        setSelectedDef(def);
        setNotifyParents(def.notifyParents);
        setStaffOnly(def.staffOnly);
        setEnableComments(def.enable.comments);
        setPhase('compose');
      }
    }
  }, [searchParams, editId]);

  useEffect(() => {
    if (!editId || editLoaded || definitions.length === 0) return;
    const post = getActivityPostById(editId);
    if (!post) {
      setToast('Activity not found');
      router.push(returnTo);
      return;
    }

    const opt = postToOption(post);
    const def =
      definitions.find((d) => d.id === post.activityTypeId) ??
      getActivityDefinitionById(post.activityTypeId) ??
      null;

    setSelected(opt);
    setSelectedDef(def);
    setTitle(post.title);
    setNotes(post.content);
    setStaffOnly(post.visibility === 'staff_only');
    setEnableComments(post.enableComments);
    setNotifyParents(post.sendPushNotification);
    setNotifyStaffIds([]);
    setAttachments(post.attachments ?? []);
    setVoiceNote(post.voiceNote ?? null);
    setYoutubePreview(post.youtubePreview ?? null);
    setYoutubeUrl(post.youtubePreview?.url ?? '');
    setSelectedStudentIds(post.audienceStudents ?? []);
    setPostingType(post.status === 'scheduled' ? 'schedule' : 'post_now');
    if (post.scheduledDate) setScheduleDate(post.scheduledDate);
    if (post.scheduledTime) {
      const parsed = post.scheduledTime.match(/(\d{1,2}):(\d{2})/);
      if (parsed) {
        const hour = parsed[1].padStart(2, '0');
        setScheduleTime(`${hour}:${parsed[2]}`);
      }
    }
    setPhase('compose');
    setEditLoaded(true);
  }, [editId, editLoaded, definitions, returnTo, router]);

  const pickActivity = (opt: ActivityCardOption) => {
    setSelected(opt);
    const def = definitions.find((d) => d.id === opt.id) ?? getActivityDefinitionById(opt.id) ?? null;
    setSelectedDef(def);
    setFieldValues({});
    if (def) {
      setNotifyParents(def.notifyParents);
      setStaffOnly(def.staffOnly);
      setEnableComments(def.enable.comments);
    }
  };

  useEffect(() => {
    if (contextStudent) {
      setSelectedStudentIds([contextStudent.id]);
    }
  }, [contextStudent]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((opt) => {
      if (category !== 'All' && opt.category !== category) return false;
      if (!q) return true;
      return (
        opt.name.toLowerCase().includes(q) ||
        opt.category.toLowerCase().includes(q)
      );
    });
  }, [options, query, category]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const goBack = () => {
    if (isEditing) {
      router.push(returnTo);
      return;
    }
    if (phase === 'compose') {
      setPhase('select');
      return;
    }
    router.push(returnTo);
  };

  const continueToCompose = () => {
    if (!selected) return;
    pickActivity(selected);
    setPhase('compose');
  };

  const missingMandatory = () => {
    if (!selectedDef) return [];
    return selectedDef.fields.filter((f) => {
      if (!f.mandatory) return false;
      const v = fieldValues[f.id];
      if (f.type === 'Yes/No') return typeof v !== 'boolean';
      if (f.type === 'Multi Select') return !Array.isArray(v) || v.length === 0;
      return typeof v !== 'string' || !v.trim();
    });
  };

  const finish = async (mode: 'draft' | 'publish') => {
    if (!selected || publishing) return;
    if (!contextStudent && selectedStudentIds.length === 0) {
      setToast('Select at least one student');
      return;
    }
    if (mode === 'publish') {
      const missing = missingMandatory();
      if (missing.length) {
        setToast(`Fill required: ${missing.map((m) => m.name).join(', ')}`);
        return;
      }
    }
    setPublishing(true);
    await new Promise((r) => window.setTimeout(r, 420));

    if (mode === 'publish') {
      const audienceIds = contextStudent
        ? [contextStudent.id]
        : selectedStudentIds;
      const when =
        postingType === 'schedule'
          ? new Date(`${scheduleDate}T${scheduleTime || '09:00'}:00`)
          : null;
      const namedFields: Record<string, string | string[] | boolean> = {};
      if (selectedDef?.fields?.length) {
        for (const f of selectedDef.fields) {
          if (fieldValues[f.id] !== undefined) namedFields[f.name] = fieldValues[f.id];
        }
      }

      const roomLabel = contextStudent?.room
        ? contextStudent.room
        : (() => {
            const first = loadStudents().find((s) => audienceIds.includes(s.id));
            return first?.roomIds[0] ? roomName(first.roomIds[0]) : '—';
          })();

      const postInput = {
        activityTypeId: selected.id,
        activityTypeName: selected.name,
        activityIcon: selected.iconName,
        category: selected.category,
        title: title.trim() || `${selected.name} update`,
        content: notes.trim(),
        studentIds: audienceIds,
        room: roomLabel,
        visibility: staffOnly ? ('staff_only' as const) : ('parents' as const),
        status: (postingType === 'schedule' ? 'scheduled' : 'posted') as 'scheduled' | 'posted',
        scheduledDate: postingType === 'schedule' ? scheduleDate : undefined,
        scheduledTime: postingType === 'schedule' ? scheduleTime : undefined,
        scheduledTimestamp: when ? when.getTime() : undefined,
        attachments,
        voiceNote,
        youtubePreview,
        notifyStaff: notifyStaffIds.length > 0,
        enableComments,
        allowParentReactions: !staffOnly,
        sendPushNotification: notifyParents,
        postedByName: 'Center Staff',
        postedByRole: 'Staff',
      };

      if (isEditing && editId) {
        updateCenterActivityPost(editId, postInput);
      } else {
        publishCenterActivityPost(postInput);

        if (!staffOnly) {
          publishParentTimelinePost({
            activityTypeId: selected.id,
            activityTypeName: selected.name,
            activityIcon: selected.iconName,
            activityColor: selected.color,
            activityBgColor: selected.bgColor,
            title: title.trim() || `${selected.name} update`,
            note: notes.trim(),
            studentIds: audienceIds,
            staffOnly: false,
            enableComments,
            allowParentReactions: true,
            attachments,
            fieldValues: namedFields,
            postedByName: 'Center Staff',
            postedByRole: 'Staff',
            status: postingType === 'schedule' ? 'scheduled' : 'posted',
            scheduledAt: when ? when.toISOString() : undefined,
          });
        }
      }
    }

    setPublishing(false);
    const label =
      mode === 'draft'
        ? 'Draft saved'
        : isEditing
          ? 'Activity updated'
          : postingType === 'schedule'
            ? 'Activity scheduled'
            : 'Activity published';
    const audienceLabel = contextStudent
      ? ` for ${contextStudent.name}`
      : ` for ${selectedStudentIds.length} student${selectedStudentIds.length === 1 ? '' : 's'}`;
    try {
      sessionStorage.setItem('panacea.postActivity.toast', `${label}${audienceLabel}`);
    } catch {
      /* ignore */
    }
    router.push(returnTo);
  };

  const SelectedIcon = selected
    ? ACTIVITY_ICON_MAP[selected.iconName] ?? Megaphone
    : Megaphone;

  const fromActivities = !contextStudent;
  const studentCount = contextStudent ? 1 : selectedStudentIds.length;

  return (
    <div className="pap-page">
      <div className="pap-ambient" aria-hidden>
        <span className="pap-blob pap-blob-a" />
        <span className="pap-blob pap-blob-b" />
        <span className="pap-blob pap-blob-c" />
      </div>

      <motion.header
        className="pap-top"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
      >
        <button type="button" className="pap-back" onClick={goBack}>
          <ArrowLeft size={16} />
          {isEditing || phase === 'compose' ? 'Back to activities' : 'Back'}
        </button>

        <div className="pap-brand">
          <span className="pap-brand-icon" aria-hidden>
            <Megaphone size={18} />
          </span>
          <div>
            <p className="pap-kicker">Parent Communication</p>
            <h1>{isEditing ? 'Update Activity' : 'Post Activity'}</h1>
            <p className="pap-sub">
              {isEditing
                ? 'Edit this activity and save your changes'
                : contextStudent
                  ? `Share a moment for ${contextStudent.name}`
                  : 'Create a classroom update in two quick steps'}
            </p>
          </div>
        </div>

        <div className="pap-top-actions">
          <button type="button" className="ui-btn ui-btn-outline" onClick={() => router.push(returnTo)}>
            Cancel
          </button>
          {phase === 'select' && !isEditing ? (
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={!selected}
              onClick={continueToCompose}
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : phase === 'compose' || isEditing ? (
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              disabled={publishing || (!contextStudent && selectedStudentIds.length === 0)}
              onClick={() => finish('publish')}
            >
              <Send size={16} />
              {publishing
                ? isEditing
                  ? 'Updating…'
                  : 'Publishing…'
                : isEditing
                  ? 'Update'
                  : postingType === 'schedule'
                    ? 'Schedule'
                    : 'Publish'}
            </button>
          ) : null}
        </div>
      </motion.header>

      <div className="pap-stepper" aria-label="Steps">
        <button
          type="button"
          className={`pap-step${phase === 'select' ? ' is-active' : ''}${phase === 'compose' ? ' is-done' : ''}`}
          onClick={() => !isEditing && setPhase('select')}
          disabled={isEditing}
        >
          <span>1</span>
          Choose activity
        </button>
        <i className={`pap-step-rail${phase === 'compose' ? ' is-on' : ''}`} aria-hidden />
        <button
          type="button"
          className={`pap-step${phase === 'compose' ? ' is-active' : ''}`}
          disabled={!selected}
          onClick={() => selected && setPhase('compose')}
        >
          <span>2</span>
          Write & send
        </button>
      </div>

      {contextStudent ? (
        <motion.div
          className="pap-context"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35, ease }}
        >
          <span className="pap-context-avatar" aria-hidden>
            <UserRound size={16} />
          </span>
          <div>
            <strong>{contextStudent.name}</strong>
            <em>{contextStudent.room || 'Student profile'}</em>
          </div>
          <span className="pap-context-tag">
            <Sparkles size={12} />
            Audience locked
          </span>
        </motion.div>
      ) : null}

      <AnimatePresence mode="wait">
        {phase === 'select' ? (
          <motion.section
            key="select"
            className="pap-panel"
            initial={{ opacity: 0, x: -24, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
            transition={{ duration: 0.34, ease }}
          >
            <div className="pap-panel-head">
              <div>
                <span className="pap-eyebrow">Step 1</span>
                <h2>What happened today?</h2>
                <p>Pick one activity type — you can refine the message next.</p>
              </div>
              <span className="pap-count">
                <strong>{filtered.length}</strong> types
              </span>
            </div>

            <div className="pap-toolbar">
              <label className="pap-search">
                <Search size={16} aria-hidden />
                <input
                  className="ui-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search activities…"
                  aria-label="Search activities"
                />
              </label>
              <div className="pap-chips" role="tablist" aria-label="Categories">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={category === cat}
                    className={`pap-chip${category === cat ? ' is-active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              className="pap-grid"
              key={`${category}-${query}`}
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.028, delayChildren: 0.04 },
                },
              }}
            >
              {filtered.map((opt) => {
                const Icon = ACTIVITY_ICON_MAP[opt.iconName] ?? Megaphone;
                const active = selected?.id === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    className={`pap-card${active ? ' is-selected' : ''}`}
                    variants={{
                      hidden: { opacity: 0, y: 14, scale: 0.96 },
                      show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease } },
                    }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => pickActivity(opt)}
                    onDoubleClick={() => {
                      pickActivity(opt);
                      setPhase('compose');
                    }}
                    aria-pressed={active}
                  >
                    <span className="pap-card-shine" aria-hidden />
                    <span
                      className="pap-card-icon"
                      style={{ background: opt.bgColor, color: opt.color }}
                    >
                      <Icon size={22} strokeWidth={2.2} />
                    </span>
                    <strong>{opt.name}</strong>
                    <em>{opt.category}</em>
                    {active ? (
                      <motion.span
                        className="pap-card-check"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                      >
                        <Check size={14} strokeWidth={3} />
                      </motion.span>
                    ) : null}
                  </motion.button>
                );
              })}
            </motion.div>

            {filtered.length === 0 ? (
              <p className="pap-empty">No activities match your search.</p>
            ) : (
              <p className="pap-hint">Tip: double-click a card to jump straight to write &amp; send.</p>
            )}
          </motion.section>
        ) : (
          <motion.section
            key="compose"
            className={`pap-compose${fromActivities ? ' is-audience-split' : ''}`}
            initial={{ opacity: 0, x: 24, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -18, filter: 'blur(4px)' }}
            transition={{ duration: 0.34, ease }}
          >
            {!fromActivities ? (
              <aside className="pap-side">
                <div className="pap-side-card">
                  <span className="pap-eyebrow">Selected</span>
                  <div className="pap-selected">
                    <span
                      className="pap-card-icon"
                      style={{
                        background: selected?.bgColor,
                        color: selected?.color,
                      }}
                    >
                      <SelectedIcon size={22} />
                    </span>
                    <div>
                      <strong>{selected?.name}</strong>
                      <em>{selected?.category}</em>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline pap-change"
                    onClick={() => setPhase('select')}
                  >
                    Change activity
                  </button>
                </div>

                <div className="pap-side-card">
                  <span className="pap-eyebrow">Audience</span>
                  <div className="pap-audience-locked">
                    <strong>{contextStudent?.name}</strong>
                    <span>{contextStudent?.room || 'Student profile'}</span>
                  </div>
                </div>
              </aside>
            ) : null}

            <div className="pap-main-form">
              {fromActivities ? (
                <div className="pap-selected pap-selected-inline">
                  <span
                    className="pap-card-icon"
                    style={{
                      background: selected?.bgColor,
                      color: selected?.color,
                    }}
                  >
                    <SelectedIcon size={22} />
                  </span>
                  <div>
                    <strong>{selected?.name}</strong>
                    <em>{selected?.category}</em>
                  </div>
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline pap-change"
                    onClick={() => setPhase('select')}
                  >
                    Change
                  </button>
                </div>
              ) : null}

              <div className={`pap-student-summary${studentCount === 0 ? ' is-warn' : ''}`}>
                <span>
                  Student <em>*</em>
                </span>
                <strong>
                  {studentCount === 0
                    ? '0 students selected'
                    : `${studentCount} student${studentCount === 1 ? '' : 's'} selected`}
                </strong>
              </div>
              <motion.div
                className="pap-form-card pap-delivery-card-wrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease }}
              >
                <span className="pap-eyebrow">Delivery</span>
                <h3>When should this go out?</h3>
                <div className="pap-delivery">
                  <button
                    type="button"
                    className={`pap-delivery-card${postingType === 'post_now' ? ' is-on' : ''}`}
                    onClick={() => setPostingType('post_now')}
                  >
                    <Send size={18} />
                    <strong>Post now</strong>
                    <em>{nowTime()} today</em>
                  </button>
                  <button
                    type="button"
                    className={`pap-delivery-card${postingType === 'schedule' ? ' is-on' : ''}`}
                    onClick={() => setPostingType('schedule')}
                  >
                    <Calendar size={18} />
                    <strong>Schedule</strong>
                    <em>Pick date &amp; time</em>
                  </button>
                </div>

                <AnimatePresence>
                  {postingType === 'schedule' ? (
                    <motion.div
                      className="pap-schedule"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="ui-field">
                        <label className="ui-label" htmlFor="pap-date">
                          Date
                        </label>
                        <input
                          id="pap-date"
                          type="date"
                          className="ui-input"
                          min={todayIso()}
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                        />
                      </div>
                      <div className="ui-field">
                        <label className="ui-label" htmlFor="pap-time">
                          Time
                        </label>
                        <div className="pap-time-wrap">
                          <Clock size={15} aria-hidden />
                          <input
                            id="pap-time"
                            type="time"
                            className="ui-input"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <label className={`pap-notify${notifyParents ? ' is-on' : ''}`}>
                  <input
                    type="checkbox"
                    checked={notifyParents}
                    onChange={(e) => setNotifyParents(e.target.checked)}
                  />
                  <Bell size={16} />
                  <span>
                    <strong>Notify parents</strong>
                    <em>Send a push notification when this posts</em>
                  </span>
                </label>
              </motion.div>

              <div className="pap-form-card">
                <span className="pap-eyebrow">Message</span>
                <h2>Write the update</h2>

                <div className="ui-field">
                  <label className="ui-label" htmlFor="pap-title">
                    Title <span className="pap-optional">(optional)</span>
                  </label>
                  <input
                    id="pap-title"
                    className="ui-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`${selected?.name ?? 'Activity'} update`}
                  />
                </div>

                <div className="ui-field">
                  <label className="ui-label" htmlFor="pap-notes">
                    Notes
                  </label>
                  <textarea
                    id="pap-notes"
                    className="ui-textarea pap-notes"
                    rows={5}
                    value={notes}
                    maxLength={500}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What should parents know? Keep it warm and clear…"
                  />
                  <span className="pap-char">{notes.length}/500</span>
                </div>
              </div>

              {selectedDef?.fields?.length ? (
                <DynamicActivityFields
                  fields={selectedDef.fields}
                  values={fieldValues}
                  onChange={(fieldId, value) =>
                    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
                  }
                />
              ) : null}

              <div className="pap-form-card pap-voice-card">
                <div className="pap-form-card-head">
                  <div>
                    <span className="pap-eyebrow">Voice</span>
                    <h3>
                      <Mic size={16} />
                      Voice note
                    </h3>
                  </div>
                </div>
                <VoiceRecorder
                  compact
                  voiceNote={voiceNote}
                  onChange={setVoiceNote}
                />
              </div>

              {selectedDef?.enable.fileUpload || selectedDef?.enable.mediaUpload || !selectedDef ? (
                <div className="pap-form-card">
                  <div className="pap-form-card-head">
                    <div>
                      <span className="pap-eyebrow">Media</span>
                      <h3>
                        <ImagePlus size={16} />
                        Photos &amp; files
                      </h3>
                    </div>
                  </div>
                  <AttachmentUploader
                    attachments={attachments}
                    onAdd={(att) => setAttachments((prev) => [...prev, att])}
                    onRemove={(id) =>
                      setAttachments((prev) => prev.filter((a) => a.id !== id))
                    }
                  />
                </div>
              ) : null}

              <div className="pap-form-card pap-advanced-card">
                <button
                  type="button"
                  className="pap-advanced-trigger"
                  onClick={() => setAdvancedOpen((v) => !v)}
                  aria-expanded={advancedOpen}
                >
                  <span>
                    <Settings2 size={16} />
                    Advanced options
                  </span>
                  <motion.span
                    animate={{ rotate: advancedOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="pap-advanced-chevron"
                    aria-hidden
                  >
                    ▾
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {advancedOpen ? (
                    <motion.div
                      className="pap-advanced-body"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.24, ease }}
                    >
                      {staffOnly ? (
                        <motion.div
                          className="pap-staff-only-banner"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          Staff only — parents will not see this activity.
                        </motion.div>
                      ) : null}

                      <div className="pap-advanced-grid">
                        <SearchableMultiSelect
                          label="Notify staff"
                          placeholder="Select staff"
                          options={staffOptions}
                          values={notifyStaffIds}
                          onChange={setNotifyStaffIds}
                          emptyText="No staff found"
                        />
                        <SearchableMultiSelect
                          label="Labels"
                          placeholder="Select label"
                          options={labelOptions}
                          values={labelIds}
                          onChange={setLabelIds}
                          emptyText="No labels found"
                        />
                      </div>

                      <div className="ui-field pap-youtube-field">
                        <label className="ui-label" htmlFor="pap-youtube">
                          <Video size={14} />
                          Youtube link
                        </label>
                        <div className="pap-youtube-row">
                          <input
                            id="pap-youtube"
                            className="ui-input"
                            value={youtubeUrl}
                            onChange={(e) => {
                              setYoutubeUrl(e.target.value);
                              if (!e.target.value.trim()) setYoutubePreview(null);
                            }}
                            placeholder="Paste youtube url"
                            onBlur={() => {
                              const id = parseYoutubeVideoId(youtubeUrl);
                              if (!id) {
                                setYoutubePreview(null);
                                return;
                              }
                              setYoutubePreview({
                                url: youtubeUrl.trim(),
                                videoId: id,
                                title: `YouTube Video (${id})`,
                                thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
                              });
                            }}
                          />
                        </div>
                        {youtubePreview ? (
                          <motion.div
                            className="pap-youtube-preview"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={youtubePreview.thumbnail}
                              alt={youtubePreview.title}
                            />
                            <span>{youtubePreview.title}</span>
                          </motion.div>
                        ) : null}
                      </div>

                      <div className="pap-toggle-row">
                        <label className={`pap-switch${staffOnly ? ' is-on' : ''}`}>
                          <input
                            type="checkbox"
                            checked={staffOnly}
                            onChange={(e) => setStaffOnly(e.target.checked)}
                          />
                          <i />
                          <span>
                            <strong>Staff Only</strong>
                            <em>Hide from parents</em>
                          </span>
                        </label>
                        <label className={`pap-switch${enableComments ? ' is-on' : ''}`}>
                          <input
                            type="checkbox"
                            checked={enableComments}
                            onChange={(e) => setEnableComments(e.target.checked)}
                          />
                          <i />
                          <span>
                            <strong>Enable comments</strong>
                            <em className="pap-switch-ico">
                              <MessageSquare size={12} />
                              Parent replies
                            </em>
                          </span>
                        </label>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="pap-footer-actions">
                {selectedDef?.enable.draftMode !== false ? (
                  <button
                    type="button"
                    className="ui-btn ui-btn-secondary"
                    disabled={publishing}
                    onClick={() => finish('draft')}
                  >
                    Save draft
                  </button>
                ) : null}
                <button
                  type="button"
                  className="ui-btn ui-btn-primary"
                  disabled={publishing || (!contextStudent && selectedStudentIds.length === 0)}
                  onClick={() => finish('publish')}
                >
                  <Send size={16} />
                  {publishing
                    ? 'Working…'
                    : postingType === 'schedule'
                      ? 'Schedule activity'
                      : 'Publish activity'}
                </button>
              </div>
            </div>

            {fromActivities ? (
              <SelectStudentsPanel
                students={allStudents}
                selectedIds={selectedStudentIds}
                onChange={setSelectedStudentIds}
                defaultCheckedIn={defaultCheckedIn}
                ignoreRoomWhenCheckedIn={ignoreRoomWhenCheckedIn}
              />
            ) : null}
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="pap-toast"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
