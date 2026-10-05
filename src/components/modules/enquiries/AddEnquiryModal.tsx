'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Baby,
  ClipboardList,
  UserRound,
  Users,
  SlidersHorizontal,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { enquiryFormSchema, type EnquiryFormValues } from './schema';
import type { CustomFieldCategory, CustomFieldDef, EnquiryRecord } from './types';
import type { EnquiryStageConfig, EnquirySource, LostReason } from '@/lib/enquiries/types';
import { FACULTY_OPTIONS, PROGRAM_OPTIONS, todayISO } from './mockData';
import { FormSection } from './FormSection';
import { ChildInformation } from './ChildInformation';
import { EnquiryInformation } from './EnquiryInformation';
import { MotherInformation } from './MotherInformation';
import { FatherInformation } from './FatherInformation';
import { CustomFields } from './CustomFields';
import { CustomFieldBuilder } from './CustomFieldBuilder';
import { DynamicCustomFields } from './DynamicCustomFields';

type ModalMode = 'create' | 'edit' | 'view';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (record: EnquiryRecord) => void;
  onUpdate?: (record: EnquiryRecord) => void;
  stages: EnquiryStageConfig[];
  sources: EnquirySource[];
  lostReasons: LostReason[];
  onManageSources: () => void;
  /** Prefill stage when opened from a Kanban column. */
  defaultStage?: string;
  mode?: ModalMode;
  editing?: EnquiryRecord | null;
};

function defaultValues(stage = 'Interested'): EnquiryFormValues {
  return {
    studentName: '',
    stage,
    gender: 'Prefer Not to Say',
    dateOfBirth: '',
    preferredName: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    school: '',
    address: '',
    subParent: '',
    createdOn: todayISO(),
    assignedTo: FACULTY_OPTIONS[0]?.id ?? '',
    source: '',
    subSource: '',
    lostReason: '',
    program: '',
    expectedStartDate: '',
    additionalNotes: '',
    motherName: '',
    motherPhone: '',
    motherEmail: '',
    motherCompany: '',
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    fatherCompany: '',
    customValues: {},
  };
}

function recordToFormValues(record: EnquiryRecord): EnquiryFormValues {
  const faculty = FACULTY_OPTIONS.find((f) => f.name === record.assignedTo);
  const program =
    PROGRAM_OPTIONS.find((p) => p.label === record.program || p.value === record.program)
      ?.value ?? '';
  return {
    ...defaultValues(record.stage),
    studentName: record.studentName,
    preferredName: record.preferredName ?? '',
    stage: record.stage,
    gender: record.gender,
    dateOfBirth: record.dateOfBirth ?? '',
    source: record.source,
    subSource: record.subSource ?? '',
    lostReason: record.lostReason ?? '',
    program,
    assignedTo: faculty?.id ?? FACULTY_OPTIONS[0]?.id ?? '',
    createdOn: record.createdOn,
    expectedStartDate: record.expectedStartDate ?? '',
    additionalNotes: record.interest ?? '',
    motherName: record.motherName ?? '',
    motherPhone: record.motherPhone ?? '',
    motherEmail: record.motherEmail ?? '',
    motherCompany: record.motherCompany ?? '',
    fatherName: record.fatherName ?? '',
    fatherPhone: record.fatherPhone ?? '',
    fatherEmail: record.fatherEmail ?? '',
    fatherCompany: record.fatherCompany ?? '',
    school: record.school ?? '',
    address: record.address ?? '',
    emergencyContactName: record.emergencyContactName ?? '',
    emergencyContactNumber: record.emergencyContactNumber ?? '',
    customValues: record.customValues ?? {},
  };
}

function ParentCustomRender({
  control,
  fields,
}: {
  control: ReturnType<typeof useForm<EnquiryFormValues>>['control'];
  fields: CustomFieldDef[];
}) {
  const values = useWatch({ control, name: 'customValues' });
  if (!fields.length) return null;
  return (
    <div className="ui-grid-2" style={{ marginTop: 14 }}>
      <DynamicCustomFields fields={fields} values={values} control={control} />
    </div>
  );
}

export function AddEnquiryModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  stages,
  sources,
  lostReasons,
  onManageSources,
  defaultStage,
  mode = 'create',
  editing = null,
}: Props) {
  const readOnly = mode === 'view';
  const [isMobile, setIsMobile] = useState(false);
  const [openSections, setOpenSections] = useState({
    child: true,
    enquiry: true,
    mother: false,
    father: false,
    custom: false,
  });
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderCategory, setBuilderCategory] = useState<CustomFieldCategory>('child');
  const [editingField, setEditingField] = useState<CustomFieldDef | null>(null);
  const [saving, setSaving] = useState(false);

  const methods = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema) as Resolver<EnquiryFormValues>,
    defaultValues: defaultValues(),
    mode: 'onBlur',
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = methods;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const active = stages.filter((s) => s.active).sort((a, b) => a.order - b.order);
    const fallback = active[0]?.name ?? 'Interested';
    const stage =
      defaultStage && active.some((s) => s.name === defaultStage) ? defaultStage : fallback;

    if ((mode === 'edit' || mode === 'view') && editing) {
      reset(recordToFormValues(editing));
    } else {
      reset(defaultValues(stage));
    }
    setCustomFields([]);
    setOpenSections({
      child: true,
      enquiry: true,
      mother: mode !== 'create',
      father: mode !== 'create',
      custom: false,
    });
    setSaving(false);
  }, [open, reset, defaultStage, stages, mode, editing]);

  const clearSubSource = useCallback(
    () => setValue('subSource', '', { shouldDirty: true }),
    [setValue],
  );

  const clearLostReason = useCallback(
    () => setValue('lostReason', '', { shouldDirty: true }),
    [setValue],
  );

  const toggleSection = useCallback((key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const childFields = useMemo(
    () => customFields.filter((f) => f.category === 'child'),
    [customFields],
  );
  const enquiryFields = useMemo(
    () => customFields.filter((f) => f.category === 'enquiry'),
    [customFields],
  );
  const parentFields = useMemo(
    () => customFields.filter((f) => f.category === 'parent'),
    [customFields],
  );

  const openBuilder = useCallback((category: CustomFieldCategory) => {
    setEditingField(null);
    setBuilderCategory(category);
    setBuilderOpen(true);
  }, []);

  const editField = useCallback((field: CustomFieldDef) => {
    setEditingField(field);
    setBuilderCategory(field.category);
    setBuilderOpen(true);
  }, []);

  const deleteField = useCallback((id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const reorderFields = useCallback(
    (category: CustomFieldCategory, from: number, to: number) => {
      setCustomFields((prev) => {
        const inCat = prev.filter((f) => f.category === category);
        const rest = prev.filter((f) => f.category !== category);
        const next = [...inCat];
        const [moved] = next.splice(from, 1);
        if (!moved) return prev;
        next.splice(to, 0, moved);
        return [...rest, ...next];
      });
    },
    [],
  );

  const saveCustomField = useCallback(
    (payload: Omit<CustomFieldDef, 'id'> & { id?: string }) => {
      setCustomFields((prev) => {
        if (payload.id) {
          return prev.map((f) => (f.id === payload.id ? { ...f, ...payload, id: payload.id } : f));
        }
        return [
          ...prev,
          {
            ...payload,
            id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          },
        ];
      });
    },
    [],
  );

  const onSubmit = handleSubmit((values) => {
    if (readOnly) return;
    for (const field of customFields) {
      if (!field.required) continue;
      const raw = values.customValues?.[field.id];
      const empty =
        raw === undefined ||
        raw === null ||
        raw === '' ||
        (field.type === 'Checkbox' && raw !== true);
      if (empty) {
        setOpenSections((s) => ({
          ...s,
          custom: true,
          child: field.category === 'child' || s.child,
          enquiry: field.category === 'enquiry' || s.enquiry,
          mother: field.category === 'parent' || s.mother,
        }));
        methods.setError('studentName', {
          message: `${field.label} is required (custom field)`,
        });
        return;
      }
    }

    const activeSource = sources.find(
      (s) => s.name === values.source && s.status === 'Active',
    );
    if (activeSource?.subSources.length && !values.subSource?.trim()) {
      methods.setError('subSource', { message: 'Sub source is required' });
      setOpenSections((s) => ({ ...s, enquiry: true }));
      return;
    }

    setSaving(true);
    try {
      const faculty = FACULTY_OPTIONS.find((f) => f.id === values.assignedTo);
      const programLabel =
        PROGRAM_OPTIONS.find((p) => p.value === values.program)?.label ?? values.program;

      const payload: EnquiryRecord = {
        id: editing?.id ?? `e${Date.now()}`,
        studentName: values.studentName,
        preferredName: values.preferredName || undefined,
        stage: values.stage,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth || undefined,
        source: values.source,
        subSource: values.subSource || undefined,
        lostReason: values.lostReason || undefined,
        program: programLabel,
        assignedTo: faculty?.name ?? values.assignedTo,
        createdOn: values.createdOn,
        expectedStartDate: values.expectedStartDate || undefined,
        motherName: values.motherName || undefined,
        motherPhone: values.motherPhone || undefined,
        motherEmail: values.motherEmail || undefined,
        motherCompany: values.motherCompany || undefined,
        fatherName: values.fatherName || undefined,
        fatherPhone: values.fatherPhone || undefined,
        fatherEmail: values.fatherEmail || undefined,
        fatherCompany: values.fatherCompany || undefined,
        school: values.school || undefined,
        address: values.address || undefined,
        emergencyContactName: values.emergencyContactName || undefined,
        emergencyContactNumber: values.emergencyContactNumber || undefined,
        interest: values.additionalNotes || undefined,
        customValues: values.customValues,
        activities: editing?.activities ?? [
          {
            id: `act-${Date.now()}`,
            type: 'created',
            title: 'Enquiry created',
            description: `Added under ${values.stage}`,
            at: new Date().toISOString(),
          },
        ],
      };

      if (mode === 'edit' && onUpdate) onUpdate(payload);
      else onCreate(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  });

  const footer = readOnly ? (
    <button type="button" className="ui-btn ui-btn-primary" onClick={onClose}>
      Close
    </button>
  ) : (
    <>
      <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={saving}>
        Cancel
      </button>
      <button type="button" className="ui-btn ui-btn-primary" onClick={onSubmit} disabled={saving}>
        {saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Save Enquiry'}
      </button>
    </>
  );

  const formBody = (
    <FormProvider {...methods}>
      <fieldset className="enq-form" disabled={readOnly} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
        <FormSection
          id="child"
          title="Child Information"
          subtitle="Student profile and emergency details"
          icon={<Baby size={18} />}
          open={openSections.child}
          onToggle={() => toggleSection('child')}
        >
          <ChildInformation
            control={control}
            errors={errors}
            customFields={childFields}
            stages={stages}
            lostReasons={lostReasons}
            onClearLostReason={clearLostReason}
          />
        </FormSection>

        <FormSection
          id="enquiry"
          title="Enquiry Information"
          subtitle="Source, assignment, and program interest"
          icon={<ClipboardList size={18} />}
          open={openSections.enquiry}
          onToggle={() => toggleSection('enquiry')}
        >
          <EnquiryInformation
            control={control}
            errors={errors}
            customFields={enquiryFields}
            sources={sources}
            onClearSubSource={clearSubSource}
            onManageSources={onManageSources}
          />
        </FormSection>

        <FormSection
          id="mother"
          title="Mother Information"
          subtitle="Primary parent / mother contact"
          icon={<UserRound size={18} />}
          open={openSections.mother}
          onToggle={() => toggleSection('mother')}
        >
          <MotherInformation control={control} errors={errors} />
          <ParentCustomRender control={control} fields={parentFields} />
        </FormSection>

        <FormSection
          id="father"
          title="Father Information"
          subtitle="Secondary parent / father contact"
          icon={<Users size={18} />}
          open={openSections.father}
          onToggle={() => toggleSection('father')}
        >
          <FatherInformation control={control} errors={errors} />
        </FormSection>

        <FormSection
          id="custom"
          title="Custom Fields"
          subtitle="Create and manage additional fields"
          icon={<SlidersHorizontal size={18} />}
          open={openSections.custom}
          onToggle={() => toggleSection('custom')}
        >
          <CustomFields
            fields={customFields}
            onAdd={openBuilder}
            onEdit={editField}
            onDelete={deleteField}
            onReorder={reorderFields}
          />
        </FormSection>
      </fieldset>

      <CustomFieldBuilder
        open={builderOpen}
        category={builderCategory}
        editing={editingField}
        onClose={() => {
          setBuilderOpen(false);
          setEditingField(null);
        }}
        onSave={saveCustomField}
      />
    </FormProvider>
  );

  const title =
    mode === 'view' ? 'Enquiry details' : mode === 'edit' ? 'Edit Enquiry' : 'Add Enquiry';
  const subtitle =
    mode === 'view'
      ? 'All fields are read-only'
      : mode === 'edit'
        ? 'Update prospective family details'
        : 'Capture a new prospective family';

  if (isMobile) {
    return (
      <Drawer open={open} title={title} subtitle={subtitle} onClose={onClose} wide footer={footer}>
        {formBody}
      </Drawer>
    );
  }

  return (
    <Modal open={open} title={title} subtitle={subtitle} onClose={onClose} xl footer={footer}>
      {formBody}
    </Modal>
  );
}
