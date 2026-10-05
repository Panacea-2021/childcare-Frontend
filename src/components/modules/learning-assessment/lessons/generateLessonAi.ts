import type { AiGenerateInput } from './types';

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type TopicPack = {
  match: RegExp;
  overview: (ctx: Ctx) => string;
  whatIs: string;
  benefits: string[];
  warmUp: string[];
  mainSteps: string[];
  teacherTips: string[];
  studentTasks: string[];
  materials: string[];
  questions: string[];
  assessment: string;
  outcomes: string[];
  safety: string[];
  extensions: string[];
  home: string;
  summary: string;
};

type Ctx = {
  topic: string;
  topicTitle: string;
  age: string;
  duration: string;
  style: string;
  goal: string;
  difficulty: string;
  tone: string;
  lessonSet: string;
  areas: string;
};

const TOPIC_PACKS: TopicPack[] = [
  {
    match: /danc|ballet|move|rhythm|groove/i,
    overview: (c) =>
      `A joyful movement lesson where children discover what dancing is, why it feels good for body and mind, and how to express ${esc(c.topic)} through safe, playful choreography.`,
    whatIs:
      'Dancing is moving your body to music, rhythm, or imagination. It can be free dance, follow-the-leader steps, or simple patterned moves.',
    benefits: [
      'Builds balance, coordination, and gross motor strength',
      'Supports listening, memory, and following multi-step directions',
      'Encourages self-expression, confidence, and social connection',
      'Releases energy in a positive, classroom-friendly way',
    ],
    warmUp: [
      'Shake-out circle: wiggle fingers, shoulders, hips, and toes to a gentle beat',
      'Echo claps: teacher claps a rhythm; children copy',
      'Freeze dance preview: move when music plays, freeze when it stops',
    ],
    mainSteps: [
      'Explore: free dance in personal space while naming body parts that move',
      'Learn 3 simple moves (e.g. step-touch, twirl, reach-high) and chain them into a short dance',
      'Perform in small groups; classmates give kind compliments (“I liked your twirl!”)',
    ],
    teacherTips: [
      'Mark safe dance spots with mats or tape so children keep personal space',
      'Model exaggerated, slow moves first, then speed up for fun',
      'Offer seated dance options for children who need lower intensity',
      'Celebrate effort and creativity—not perfect steps',
    ],
    studentTasks: [
      'Invent one original dance move and teach it to a partner',
      'Match movements to loud/soft or fast/slow music',
      'Draw or stamp their favorite dance move after performing',
    ],
    materials: [
      'Age-appropriate music playlist and speaker',
      'Scarves, ribbons, or streamers (optional)',
      'Floor markers / yoga mats for personal space',
      'Visual cards showing each dance move',
    ],
    questions: [
      'What is dancing?',
      'How does dancing make your body feel?',
      'Which move was easiest? Which was most fun?',
      'How can we dance safely with friends nearby?',
    ],
    assessment:
      'Observe participation, spatial awareness, ability to copy/sequence 2–3 moves, and willingness to share. Use Emerging / Developing / Secure for listening, coordination, and confidence.',
    outcomes: [
      'Children can explain dancing in simple words',
      'Children perform a short sequence with support',
      'Children show safer body awareness during group movement',
    ],
    safety: [
      'Clear furniture and tripping hazards before music starts',
      'No running slides; soft knees and gentle feet',
      'Volume at a comfortable level; offer quiet breaks',
      'Hydration break if energy is high',
    ],
    extensions: [
      'Create a class “dance story” about an animal or weather',
      'Add instruments for children ready for rhythm challenge',
      'Film a short class performance for families (with consent)',
    ],
    home: 'Ask your child to teach you their favorite dance move. Play one song and dance together for 5 minutes—laughing counts as learning!',
    summary:
      'Children learn what dancing is, practice safe expressive movement, and leave feeling proud of their bodies and ideas.',
  },
  {
    match: /animal|zoo|pet|farm|wildlife|creature/i,
    overview: (c) =>
      `Children explore ${esc(c.topicTitle)} through stories, sounds, movement, and sorting—building vocabulary, empathy, and curiosity about living creatures.`,
    whatIs:
      'Animals are living creatures that move, eat, grow, and need care. Some live with people (pets), some on farms, and some in the wild.',
    benefits: [
      'Expands vocabulary (names, habitats, body parts)',
      'Builds empathy and gentle-care attitudes',
      'Supports classification and observation skills',
      'Connects literacy, science, and dramatic play',
    ],
    warmUp: [
      'Animal sound circle: teacher makes a sound; children guess',
      'Move like… hop like a frog, stretch like a cat, waddle like a duck',
      'Show a mystery animal picture card and collect predictions',
    ],
    mainSteps: [
      'Explore picture cards / soft toys and sort by land, water, or air',
      'Create an animal habitat tray or collage with recycled materials',
      'Retell one animal fact using complete sentences',
    ],
    teacherTips: [
      'Use real photos alongside cartoons for accurate learning',
      'Invite children to share pet experiences respectfully',
      'Pre-teach 4–6 key words with visuals',
      'Offer quiet observation for children who prefer less noise',
    ],
    studentTasks: [
      'Match baby animals to adults',
      'Act out how an animal moves and eats',
      'Draw an animal and label one body part',
    ],
    materials: [
      'Animal picture cards or figurines',
      'Sorting mats (land / water / air)',
      'Art materials for habitat collage',
      'Optional non-fiction picture book',
    ],
    questions: [
      'What makes something an animal?',
      'Where does this animal live?',
      'How do we care for pets kindly?',
      'What is one new animal fact you learned?',
    ],
    assessment:
      'Listen for correct animal names, habitat talk, and gentle role-play. Note classification accuracy and new vocabulary use.',
    outcomes: [
      'Children name several animals and one habitat',
      'Children sort animals with support',
      'Children demonstrate kind, caring language about living things',
    ],
    safety: [
      'No real animal handling unless approved and supervised',
      'Sanitize shared toys after play',
      'Watch for allergies to plush fillers or feathers in crafts',
    ],
    extensions: [
      'Build a class “zoo map”',
      'Compare animal coverings: fur, feathers, scales',
      'Invite a guest (vet talk / virtual zoo cam) if available',
    ],
    home: 'On a walk or at home, notice one animal or insect together. Ask: “What does it need to live?”',
    summary:
      'Children discover animals through play, sorting, and storytelling—growing language, science thinking, and kindness.',
  },
  {
    match: /solar|planet|space|star|moon|galaxy|astronaut|sun/i,
    overview: (c) =>
      `An awe-filled introduction to ${esc(c.topicTitle)} where children learn simple space ideas through models, movement, and wonder questions suited to ${esc(c.age)}.`,
    whatIs:
      'The solar system is our Sun and the planets that travel around it. Earth is our home planet; the Moon orbits Earth; stars are suns that look tiny because they are far away.',
    benefits: [
      'Sparks scientific curiosity and vocabulary',
      'Builds early concepts of size, distance, and orbit (age-scaled)',
      'Supports imaginative play and storytelling',
      'Encourages asking “why” and “how” questions',
    ],
    warmUp: [
      'Lights-down “stargaze” with glow dots on the ceiling/wall',
      'Float like astronauts in slow-motion movement',
      'Pass a “planet ball” and say one space word',
    ],
    mainSteps: [
      'Build a simple model: Sun in the center, children as planets walking orbits',
      'Order a few planets by size using foam balls or paper circles',
      'Create a space journal page: draw Earth, Moon, or a rocket',
    ],
    teacherTips: [
      'Keep facts simple and concrete—avoid overwhelming numbers',
      'Use metaphors: “The Moon is Earth’s friend that visits in circles”',
      'Clarify day/night with a flashlight Earth demo if possible',
      'Invite wonder; it is OK to say “scientists are still learning”',
    ],
    studentTasks: [
      'Act out day and night by spinning gently',
      'Design a paper rocket and name its mission',
      'Match planet cards to size order (subset for younger ages)',
    ],
    materials: [
      'Yellow “Sun” ball or lamp',
      'Planet cards / different sized spheres',
      'Flashlight for day/night demo',
      'Black paper, chalk/gel pens for night sky art',
    ],
    questions: [
      'What is the Sun?',
      'Why does the Moon look different sometimes?',
      'What would you pack for a trip to space?',
      'How is Earth special for living things?',
    ],
    assessment:
      'Check for accurate use of Sun / Earth / Moon words, participation in orbit model, and ability to share one space fact.',
    outcomes: [
      'Children identify Sun, Earth, and Moon',
      'Children demonstrate a simple orbit with support',
      'Children express curiosity through questions or drawings',
    ],
    safety: [
      'No staring at the real Sun',
      'Control running during “orbit” games',
      'Supervise flashlight use; avoid shining in eyes',
    ],
    extensions: [
      'Count “craters” with playdough Moon',
      'Compare rocky vs gas giant planets with pictures',
      'Write a class poem: “If I floated in space…”',
    ],
    home: 'Look at the night sky together (even from a window). Spot the Moon and talk about what you notice.',
    summary:
      'Children meet the solar system with wonder—learning core space words through models, movement, and creative response.',
  },
  {
    match: /number|count|math|add|subtract|numeral/i,
    overview: (c) =>
      `A hands-on numeracy lesson focused on ${esc(c.topicTitle)}, helping children count, compare, and play with quantities through ${esc(c.style.toLowerCase())} experiences.`,
    whatIs:
      'Numbers help us count how many things we have, compare amounts, and solve everyday problems.',
    benefits: [
      'Strengthens one-to-one counting',
      'Builds number recognition and vocabulary',
      'Supports problem solving and attention',
      'Connects math to real classroom life',
    ],
    warmUp: [
      'Count claps, stomps, or jumps together',
      'Number hunt: find a quantity matching a card',
      'Finger flash: show a number without speaking',
    ],
    mainSteps: [
      'Count collections with manipulatives using one-to-one pointing',
      'Compare groups: more, less, same',
      'Play a simple target game (make 5 / make 10 depending on age)',
    ],
    teacherTips: [
      'Model slow counting with finger points',
      'Offer smaller sets for support; larger sets for challenge',
      'Narrate math language: altogether, leftover, equal',
      'Keep materials organized in trays to reduce overwhelm',
    ],
    studentTasks: [
      'Build towers matching number cards',
      'Sort objects into numbered baskets',
      'Record a count with tallies or numerals',
    ],
    materials: [
      'Counters, cubes, or natural objects',
      'Number cards',
      'Ten-frames or sorting bowls',
      'Clipboards for recording (older bands)',
    ],
    questions: [
      'How many do you have?',
      'Who has more? How do you know?',
      'What number comes next?',
      'How did you figure that out?',
    ],
    assessment:
      'Note accuracy of one-to-one counting, number naming, and comparison language. Capture strategies children use.',
    outcomes: [
      'Children count a set accurately within their band',
      'Children compare two groups with support',
      'Children use number words in context',
    ],
    safety: [
      'Choose choke-safe manipulatives for younger ages',
      'Keep small pieces supervised',
    ],
    extensions: [
      'Simple addition stories with toys',
      'Estimate then count a jar',
      'Create a class number book',
    ],
    home: 'Count stairs, fruit, or toys together. Ask “What if we add one more?”',
    summary:
      'Children grow confident with numbers through counting play, comparison talk, and joyful practice.',
  },
  {
    match: /alphabet|letter|phonic|sound|abc|spell/i,
    overview: (c) =>
      `A literacy-rich session on ${esc(c.topicTitle)} that links letters, sounds, and words through songs, sorting, and hands-on print play.`,
    whatIs:
      'The alphabet is a set of letters. Each letter has a name and often a sound. Letters join together to make words.',
    benefits: [
      'Builds letter recognition and phonological awareness',
      'Supports early reading and writing readiness',
      'Strengthens listening and oral language',
      'Makes print meaningful and playful',
    ],
    warmUp: [
      'Alphabet song with motion for target letters',
      'Sound stretch: say a word slowly and clap syllables',
      'Mystery letter bag: feel a letter shape and guess',
    ],
    mainSteps: [
      'Introduce 1–3 focus letters with name + sound + gesture',
      'Sort objects/pictures that start with the focus sound',
      'Form letters with fingers, sand, or playdough; attempt writing with support',
    ],
    teacherTips: [
      'Keep the focus narrow—quality over quantity of letters',
      'Use consistent keyword pictures for each sound',
      'Accept approximate letter formation for younger writers',
      'Blend whole-group and small-group turns',
    ],
    studentTasks: [
      'Find the letter in the classroom print',
      'Match uppercase and lowercase',
      'Invent an alliteration phrase (“bouncing bears”)',
    ],
    materials: [
      'Letter cards / magnetic letters',
      'Sound sorting pictures',
      'Sand tray or playdough',
      'Alphabet chart at child height',
    ],
    questions: [
      'What is this letter called?',
      'What sound does it make?',
      'Can you think of a word that starts with this sound?',
      'Where else do you see this letter?',
    ],
    assessment:
      'Check letter naming, sound linking, and sorting accuracy. Note engagement with formation activities.',
    outcomes: [
      'Children recognize focus letters',
      'Children produce or approximate the related sound',
      'Children connect letters to familiar words/objects',
    ],
    safety: [
      'Supervise small magnetic pieces',
      'Use non-toxic dough and wash hands after',
    ],
    extensions: [
      'Build names with letter tiles',
      'Beginning sound bingo',
      'Shared writing of a class sentence',
    ],
    home: 'Spot today’s letter on food packages or signs. Say the sound together three times.',
    summary:
      'Children connect letters, sounds, and meaning through multi-sensory alphabet play.',
  },
  {
    match: /color|colour|paint|rainbow|hue/i,
    overview: (c) =>
      `Children investigate ${esc(c.topicTitle)} by naming colors, mixing, matching, and talking about how colors appear in their world.`,
    whatIs:
      'Colors are what we see when light and our eyes work together. We can name colors, mix them, and use them to create art and sort objects.',
    benefits: [
      'Builds color vocabulary and observation',
      'Supports classification and visual discrimination',
      'Invites creativity and descriptive language',
      'Connects science (mixing) with art',
    ],
    warmUp: [
      'Color I-spy around the room',
      'Hold up color cards; children wearing/touching that color stand',
      'Sing a short color song with movements',
    ],
    mainSteps: [
      'Explore primary colors and try one mix (e.g. blue + yellow)',
      'Sort objects by color families',
      'Create a collaborative rainbow or color collage',
    ],
    teacherTips: [
      'Name shades gently (light/dark) without overloading',
      'Provide smocks and wipe stations',
      'Offer pre-mixed options for children who prefer less mess',
      'Talk through predictions before mixing',
    ],
    studentTasks: [
      'Find three classroom items of one color',
      'Mix a “mystery color” and name it',
      'Paint or stamp a color pattern',
    ],
    materials: [
      'Paint or color paddles',
      'Sorting objects by color',
      'Paper, brushes, smocks',
      'Color word cards',
    ],
    questions: [
      'What colors do you see?',
      'What happens when we mix these two?',
      'Where have you seen this color outside?',
      'How does this color make you feel?',
    ],
    assessment:
      'Note accurate color naming, sorting, and willingness to describe mixes. Capture new vocabulary.',
    outcomes: [
      'Children name common colors',
      'Children sort by color with support',
      'Children describe a simple mixing result',
    ],
    safety: [
      'Use washable, non-toxic paints',
      'Protect clothing and floors',
      'Check allergies to materials',
    ],
    extensions: [
      'Explore warm vs cool colors',
      'Make monochrome art',
      'Graph favorite colors as a class',
    ],
    home: 'Go on a one-color hunt at home. Photograph or draw what you find.',
    summary:
      'Children strengthen color language and creative thinking through sorting, mixing, and artful play.',
  },
  {
    match: /plant|garden|seed|flower|tree|leaf|grow/i,
    overview: (c) =>
      `A nature-based lesson on ${esc(c.topicTitle)} where children learn how plants grow, what they need, and how to care for living things.`,
    whatIs:
      'Plants are living things that often have roots, stems, and leaves. Many grow from seeds and need water, light, air, and soil or care to thrive.',
    benefits: [
      'Builds science vocabulary and responsibility',
      'Supports observation and sequencing (life cycles)',
      'Connects outdoor learning and fine motor care tasks',
      'Encourages environmental awareness',
    ],
    warmUp: [
      'Seed shake: guess what’s inside sealed containers',
      'Grow tall like a tree stretch sequence',
      'Look at real leaves with magnifying glasses',
    ],
    mainSteps: [
      'Discuss what plants need; chart ideas together',
      'Plant seeds or arrange a care routine for a class plant',
      'Sequence growth cards: seed → sprout → plant → flower/fruit',
    ],
    teacherTips: [
      'Use real specimens when possible',
      'Keep watering jobs on a child-friendly schedule',
      'Link to seasons and weather in simple language',
      'Invite sensory exploration (smell mint, feel soil) with consent',
    ],
    studentTasks: [
      'Draw a plant and label parts with support',
      'Water and observe; dictate a science note',
      'Sort living vs non-living pictures',
    ],
    materials: [
      'Seeds, cups, soil (or pre-grown plants)',
      'Magnifying glasses',
      'Life-cycle sequence cards',
      'Chart paper for “plants need…”',
    ],
    questions: [
      'What do plants need to grow?',
      'What parts of a plant can you name?',
      'What would happen with no water or no light?',
      'How can we help plants outside?',
    ],
    assessment:
      'Listen for needs-of-plants talk, sequencing accuracy, and careful handling during planting/care.',
    outcomes: [
      'Children name basic plant needs',
      'Children sequence a simple growth story',
      'Children show gentle care behaviors',
    ],
    safety: [
      'Hand washing after soil work',
      'Check plant toxicity; use only safe classroom plants',
      'Supervise tools; no tasting unknown plants',
    ],
    extensions: [
      'Measure sprout growth over a week',
      'Compare sun vs shade experiments',
      'Create recycled planters',
    ],
    home: 'Water a plant together or look for leaves on a walk. Talk about what the plant might need today.',
    summary:
      'Children learn how plants live and grow—and practice being careful caretakers of nature.',
  },
];

function defaultPack(topicTitle: string): TopicPack {
  return {
    match: /.*/,
    overview: (c) =>
      `A thoughtfully planned ${esc(c.style.toLowerCase())} lesson on <strong>${esc(topicTitle)}</strong> for ${esc(c.age)}, designed to build ${esc(c.goal.toLowerCase())} through clear steps, rich talk, and joyful practice.`,
    whatIs: `${topicTitle} is an important idea children can explore through play, conversation, hands-on materials, and reflection.`,
    benefits: [
      'Builds knowledge and vocabulary around the topic',
      'Strengthens attention, collaboration, and confidence',
      'Connects learning to real experiences',
      'Supports the selected development areas through active engagement',
    ],
    warmUp: [
      'Welcome circle with a topic picture or prop',
      'Quick movement or song linked to the theme',
      'Ask what children already know or wonder',
    ],
    mainSteps: [
      'Explore materials or visuals related to the topic',
      'Complete a guided hands-on task that shows understanding',
      'Share discoveries with a partner or the group',
    ],
    teacherTips: [
      'Prepare materials and label stations before children arrive',
      'Model first, then observe and scaffold',
      'Use open questions and wait time',
      'Differentiate with simpler and stretch options',
    ],
    studentTasks: [
      'Hands-on exploration of topic materials',
      'Partner talk using new vocabulary',
      'Creative response (draw, build, move, or tell)',
      'Closing celebration of effort',
    ],
    materials: [
      'Topic visuals or real objects',
      'Age-safe manipulatives or art props',
      'Chart paper / markers',
      'Optional related book or short clip',
    ],
    questions: [
      `What is ${topicTitle}?`,
      'What did you notice?',
      'What was surprising or fun?',
      'How can we practice this again?',
    ],
    assessment:
      'Use formative observation with a simple Emerging / Developing / Secure checklist on participation, vocabulary, and task completion.',
    outcomes: [
      'Children can talk about the topic using new words',
      'Children demonstrate related skills through the main task',
      'Children show growth in the chosen learning goal',
    ],
    safety: [
      'Check materials for age suitability',
      'Keep pathways clear during active moments',
      'Supervise closely and model kind, gentle interactions',
    ],
    extensions: [
      'Add a challenge station for ready learners',
      'Connect the topic to another development area tomorrow',
      'Create a class display of learning',
    ],
    home: `Ask your child to teach you one thing about ${topicTitle}. Spend 5–10 minutes noticing it together at home.`,
    summary: `Children explore ${topicTitle} through warm-up, main activity, sharing, and reflection—building skills, language, and confidence.`,
  };
}

function pickPack(topic: string): TopicPack {
  return TOPIC_PACKS.find((p) => p.match.test(topic)) ?? defaultPack(topic);
}

function list(items: string[]) {
  return `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
}

function ordered(items: string[]) {
  return `<ol>${items.map((i) => `<li>${i}</li>`).join('')}</ol>`;
}

/** Client-side professional lesson plan generator with topic-aware content. */
export function generateLessonDescription(input: AiGenerateInput): string {
  const topic = input.keywords.trim() || 'this topic';
  const topicTitle = topic.charAt(0).toUpperCase() + topic.slice(1);
  const areas =
    input.developmentAreas.length > 0
      ? input.developmentAreas.join(', ')
      : 'general early-childhood development';
  const ctx: Ctx = {
    topic,
    topicTitle,
    age: input.ageBand || 'early years',
    duration: input.duration || '30 mins',
    style: input.teachingStyle || 'Play Based',
    goal: input.learningGoal || 'Confidence',
    difficulty: input.difficulty || 'Easy',
    tone: input.teachingTone || 'Friendly',
    lessonSet: input.lessonSet || 'Morning Session',
    areas,
  };

  const pack = pickPack(topic);
  const difficultyNote =
    ctx.difficulty === 'Easy'
      ? 'Keep steps short, model often, and celebrate every attempt.'
      : ctx.difficulty === 'Advanced'
        ? 'Add multi-step challenges, peer teaching, and richer vocabulary.'
        : 'Balance support with gentle stretch questions.';

  const toneNote =
    ctx.tone === 'Fun'
      ? 'Keep energy playful with humor and celebration.'
      : ctx.tone === 'Professional'
        ? 'Keep language clear, calm, and purposeful.'
        : 'Keep language warm, encouraging, and inviting.';

  return `
<h2>Lesson Overview</h2>
<p>${pack.overview(ctx)}</p>
<p><strong>Session:</strong> ${esc(ctx.lessonSet)} · <strong>Age band:</strong> ${esc(ctx.age)} · <strong>Duration:</strong> ${esc(ctx.duration)} · <strong>Style:</strong> ${esc(ctx.style)} · <strong>Tone:</strong> ${esc(ctx.tone)} · <strong>Level:</strong> ${esc(ctx.difficulty)}</p>
<p><strong>Development focus:</strong> ${esc(areas)} · <strong>Learning goal:</strong> ${esc(ctx.goal)}</p>

<h2>What ${esc(topicTitle)} Is</h2>
<p>${pack.whatIs}</p>

<h2>Benefits of Learning About ${esc(topicTitle)}</h2>
${list(pack.benefits)}

<h2>Learning Objectives</h2>
<ul>
  <li>Explain ${esc(topicTitle)} in an age-appropriate way.</li>
  <li>Participate in hands-on exploration linked to ${esc(areas)}.</li>
  <li>Practice skills that build ${esc(ctx.goal.toLowerCase())}.</li>
  <li>Share one discovery using new topic vocabulary.</li>
</ul>

<h2>Introduction</h2>
<p>Greet children with a ${esc(ctx.tone.toLowerCase())} welcome. Show a clear visual or prop about ${esc(topic)}. Ask: <em>“What do we already know about ${esc(topic)}?”</em> Capture ideas. Preview today’s mission in one exciting sentence. ${toneNote}</p>

<h2>Warm-up Activity</h2>
${list(pack.warmUp)}

<h2>Main Activity</h2>
<p>Guide a ${esc(ctx.style.toLowerCase())} exploration of ${esc(topicTitle)}:</p>
${ordered(pack.mainSteps)}
<p>${difficultyNote}</p>

<h2>How Students Will Learn</h2>
<p>Students learn by doing, talking, and reflecting: first they experience ${esc(topic)}, then they practice with support, then they share what they noticed. Teachers coach, observe, and extend thinking rather than lecturing.</p>

<h2>Teacher Instructions</h2>
${list(pack.teacherTips)}

<h2>Student Activities</h2>
${list(pack.studentTasks)}

<h2>Materials Required</h2>
${list(pack.materials)}

<h2>Questions to Ask</h2>
${list(pack.questions)}

<h2>Assessment Method</h2>
<p>${pack.assessment}</p>

<h2>Learning Outcomes</h2>
${list(pack.outcomes)}

<h2>Safety Notes</h2>
${list(pack.safety)}

<h2>Extension Activities</h2>
${list(pack.extensions)}

<h2>Home Activity</h2>
<p>${pack.home}</p>

<h2>Summary</h2>
<p>${pack.summary}</p>
<p>Close the lesson by inviting each child to share one word, move, or drawing about ${esc(topicTitle)}. End with appreciation for teamwork and curiosity.</p>
`.trim();
}
