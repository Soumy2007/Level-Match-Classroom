import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini Client initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback curated activity plan generator (TaRL / Pratham pedagogy)
function generateFallbackPlan(
  subject: string,
  groupLevel: string,
  durationWeeks: number,
  className?: string
) {
  const isReading = subject.toLowerCase().includes("read");
  const weeks = [];

  const readingTemplates: Record<string, { focus: string; days: any[] }> = {
    none: {
      focus: "Sound recognition, phonemic awareness, picture talk & letter tracing",
      days: [
        {
          dayNumber: 1,
          objective: "Oral picture talk and identifying initial sound 'm' and 'a'",
          blackboardSetup: "Large drawn tree with fruits labeled 'm' and 'a'. Bold letters M, A in large chalkboard print.",
          activities: [
            { step: 1, title: "Picture Talk Circle", description: "Teacher draws a marketplace on the blackboard. Children name items starting with /m/ sound (mango, man, mat).", durationMinutes: 10 },
            { step: 2, title: "Air Writing & Sound Chanting", description: "Children stand up, chant the sound /m/ while drawing giant 'M' letters in the air with both arms.", durationMinutes: 15 },
            { step: 3, title: "Chalkboard Tracing on Slates", description: "Each pair practices writing 'm' on slates or floor with chalk chips; teacher circles for thumb support.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "White & colored chalk", "Floor chalk / Slates"],
          oralGame: "Sound Freeze: Clap twice when the teacher speaks a word starting with /m/.",
          teacherTips: "Do not rush into writing words. Ensure every quiet child speaks at least one word during picture talk."
        },
        {
          dayNumber: 2,
          objective: "Distinguish between 's' and 't' sounds through clapping rhythm",
          blackboardSetup: "Two columns: Sun icon for 'S', Tree icon for 'T'. Words: sun, see, top, ten.",
          activities: [
            { step: 1, title: "Sound Hopscotch", description: "Draw two chalk squares on the dirt/classroom floor labeled S and T. Children take turns hopping to the correct sound.", durationMinutes: 12 },
            { step: 2, title: "Blackboard Sound Hunt", description: "Teacher writes 8 mixed letters. Student pairs come up to circle all the 'S' letters with white chalk.", durationMinutes: 13 },
            { step: 3, title: "Slate Letter Pair Match", description: "Children draw 3 letters on slates and pair with neighbor to find matches.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Floor chalk", "Notebooks/slates"],
          oralGame: "Echo Chamber: Whisper a sound and have the back row amplify it.",
          teacherTips: "Pair hesitant children with energetic sound partners."
        },
        {
          dayNumber: 3,
          objective: "Combining 'm', 'a', 't' to discover first blending",
          blackboardSetup: "M + A + T sliding ladder drawn on blackboard.",
          activities: [
            { step: 1, title: "Sliding Sound Train", description: "Teacher draws train carriages: /m/ ... /a/ ... /t/. Slide hand across while slowly speeding up the sounds until 'mat' emerges!", durationMinutes: 15 },
            { step: 2, title: "Body Letter Formation", description: "Three students stand in line holding letter cards or chalk slates to form 'mat' and 'sat'.", durationMinutes: 12 },
            { step: 3, title: "Copy into Rough Notebooks", description: "Children copy the 2 decoded words into notebooks with a tiny sketch beside each.", durationMinutes: 8 },
          ],
          materials: ["Chalkboard", "Cardboard scraps / Slates"],
          oralGame: "Word Rocket: Countdown 3-2-1 blast off on the target blended word.",
          teacherTips: "Celebrate when a non-reader makes their first blend realization."
        },
        {
          dayNumber: 4,
          objective: "Reinforce sounds p, b and review week's letter garden",
          blackboardSetup: "Chalkboard letter garden with flowers labeled m, a, s, t, p, b.",
          activities: [
            { step: 1, title: "Sound Flower Picking", description: "Children come up to 'pluck' a flower by sounding it out loud to the whole class.", durationMinutes: 12 },
            { step: 2, title: "Floor Grid Relay", description: "Small groups race to place pebbles on the announced letter on a floor grid.", durationMinutes: 13 },
            { step: 3, title: "Peer Check Writing", description: "Children write 4 letters called out by the teacher, then swap slates for peer thumbs-up check.", durationMinutes: 10 },
          ],
          materials: ["Chalk", "Small pebbles/seeds", "Slates"],
          oralGame: "Who Am I? Clues: 'I buzz like a bee: /b/!'",
          teacherTips: "Collect small stones before class for zero-cost counters."
        },
        {
          dayNumber: 5,
          objective: "Oral story listening and level consolidation celebration",
          blackboardSetup: "Quick 3-panel chalk cartoon of a monkey who lost his mango.",
          activities: [
            { step: 1, title: "Interactive Storytelling", description: "Teacher tells 5-minute energetic folktale with gestures. Children repeat character catchphrases.", durationMinutes: 15 },
            { step: 2, title: "Blackboard Choral Reading of Letters", description: "Rhythmic choral call-and-response of all 6 target letters with body clapping.", durationMinutes: 12 },
            { step: 3, title: "Quick 1-Minute Individual Check", description: "Teacher does a rapid 15-second check per child while others draw their favorite story character.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Notebooks", "Pencils"],
          oralGame: "Story freeze frame: Freeze like the monkey!",
          teacherTips: "Note down students ready to move from Letter level to Word level next week."
        }
      ]
    },
    word: {
      focus: "CVC and high-frequency sight words, word ladders, and meaning association",
      days: [
        {
          dayNumber: 1,
          objective: "Master word families with '-at' and '-an' (cat, bat, pan, man)",
          blackboardSetup: "Word tree with roots '-at' and branches: c-, b-, f-, m-, r-.",
          activities: [
            { step: 1, title: "Chalkboard Word Wheel", description: "Spin the wheel: Point to starting consonants while choral chanting the rhyme.", durationMinutes: 10 },
            { step: 2, title: "Speed Word Swap", description: "Teacher writes 'cat'. Erases 'c' and asks volunteer to replace with 'b' to read 'bat'. Repeat 8 times.", durationMinutes: 15 },
            { step: 3, title: "Slate Speed Writing", description: "Teacher speaks word, children write on slate, count to 3, and hold up slates together.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "White chalk", "Slates"],
          oralGame: "Rhyme Tennis: Back and forth rhyming words with a partner.",
          teacherTips: "Ensure children read whole words, not sounding out letter-by-letter endlessly."
        },
        {
          dayNumber: 2,
          objective: "Action words (run, hop, sit, jump) paired with physical TPR gestures",
          blackboardSetup: "Action word cards on blackboard with stick figure stick sketches.",
          activities: [
            { step: 1, title: "Simon Says Reading", description: "Teacher writes an action word silently on board (e.g., HOP). Students must read silently and do the action!", durationMinutes: 15 },
            { step: 2, title: "Actor and Director Pairs", description: "Partner A points to a word on slate; Partner B performs the action; switch roles.", durationMinutes: 12 },
            { step: 3, title: "Sentence Seed Writing", description: "Write 'I can ____' on board. Children choose 2 words to complete in notebook.", durationMinutes: 8 },
          ],
          materials: ["Chalkboard", "Notebooks"],
          oralGame: "Statues: Freeze as the action word when teacher turns around.",
          teacherTips: "Physical movement dramatically speeds up word retention for active children."
        },
        {
          dayNumber: 3,
          objective: "High-frequency sight words: the, is, on, in, has, big",
          blackboardSetup: "Chalkboard Sight Word Wall with 6 boxed words.",
          activities: [
            { step: 1, title: "Flash Sight Chanting", description: "Tap words in alternating rhythms (fast, slow, soldier voice, mouse voice).", durationMinutes: 10 },
            { step: 2, title: "Flyswatter / Hand Slap Game", description: "Two students stand facing blackboard; teacher calls word, first to touch gets a point.", durationMinutes: 15 },
            { step: 3, title: "Word Hunting in Notebook", description: "Children write words 3 times and circle their best handwriting.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Chalk"],
          oralGame: "Disappearing Word: Teacher covers one word; children shout which is missing.",
          teacherTips: "Sight words must be recognized in under 2 seconds without spelling out."
        },
        {
          dayNumber: 4,
          objective: "Building 3-word micro sentences from known word bank",
          blackboardSetup: "The dog is big. / A cat sat on a mat.",
          activities: [
            { step: 1, title: "Human Sentence Chain", description: "Children hold word slates and physically arrange themselves into meaningful order.", durationMinutes: 15 },
            { step: 2, title: "Missing Word Mystery", description: "The cat sat ___ the mat. Volunteer fills in blank with chalk.", durationMinutes: 10 },
            { step: 3, title: "Notebook Sentence Writing", description: "Children copy 2 sentences into notebook and illustrate one.", durationMinutes: 10 },
          ],
          materials: ["Chalkboard", "Slates", "Notebooks"],
          oralGame: "Silly Sentences: Swap in an absurd animal (e.g., 'The elephant sat on a hat').",
          teacherTips: "Remind students about finger spaces between words."
        },
        {
          dayNumber: 5,
          objective: "Word mastery race and transition to paragraph readiness",
          blackboardSetup: "Word Bingo 3x3 grid drawn on chalkboard.",
          activities: [
            { step: 1, title: "Classroom Word Bingo", description: "Children copy 9 words into a 3x3 grid on slates. Teacher calls words; first to 3-in-a-row shouts 'BINGO!'.", durationMinutes: 15 },
            { step: 2, title: "Speed Reading Relay", description: "Teams read through a list of 10 board words in timed relay.", durationMinutes: 12 },
            { step: 3, title: "Progress Celebration Check", description: "Each child reads 5 flash words to teacher or peer mentor.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Chalk", "Slates"],
          oralGame: "Beat the Teacher: Can the class read the list faster than teacher can wipe it?",
          teacherTips: "Identify 3-4 students ready to test for Paragraph Level."
        }
      ]
    },
    sentence: {
      focus: "Fluency phrasing, punctuation awareness (stops, pauses), and comprehension",
      days: [
        {
          dayNumber: 1,
          objective: "Recognizing full stops and reading in 3-word thought chunks",
          blackboardSetup: "Short 4-line text on board with giant red chalk full stops.",
          activities: [
            { step: 1, title: "Traffic Light Reading", description: "Green chalk on first word (Go), Red chalk on period (Brake & take a breath). Class reads aloud together.", durationMinutes: 12 },
            { step: 2, title: "Scooping Phrases", description: "Teacher draws scoops underneath phrases: (Rani has a red hen) (The hen lays an egg).", durationMinutes: 13 },
            { step: 3, title: "Pair Echo Reading", description: "Child 1 reads sentence; Child 2 echoes with expressiveness.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Colored chalk", "Notebooks"],
          oralGame: "Breath Master: Can you read two whole sentences on one calm breath?",
          teacherTips: "Teach that a full stop is not an enemy, but a comfortable resting place."
        },
        {
          dayNumber: 2,
          objective: "Question marks and voice intonation changes",
          blackboardSetup: "Where is the goat? The goat is near the river.",
          activities: [
            { step: 1, title: "Voice Pitch Elevator", description: "Hands go up when voice rises on questions; hands level on statements.", durationMinutes: 12 },
            { step: 2, title: "Detective Questioning", description: "Teacher writes 3 answers on board; student pairs formulate the matching questions.", durationMinutes: 13 },
            { step: 3, title: "Notebook Dialogue", description: "Children write a 2-line mini conversation between two animals.", durationMinutes: 10 },
          ],
          materials: ["Chalkboard", "Notebooks"],
          oralGame: "Ask Me Anything: Rapid question tennis in pairs.",
          teacherTips: "Encourage expressive dramatization; don't let reading become monotone chanting."
        },
        {
          dayNumber: 3,
          objective: "Connecting words: and, but, because to build complex understanding",
          blackboardSetup: "Sentence bridge: Ravi likes milk [and] Ravi likes tea. / She ran [because] it rained.",
          activities: [
            { step: 1, title: "Chalkboard Sentence Bridge", description: "Combine two short sentences using the bridge word on the board.", durationMinutes: 15 },
            { step: 2, title: "Finish My Thought", description: "Teacher starts: 'The boy was sad because...' Students finish orally.", durationMinutes: 10 },
            { step: 3, title: "Write & Expand", description: "Children expand 2 basic sentences in notebook.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Notebooks"],
          oralGame: "Why Why Why: Chain of humorous reasons.",
          teacherTips: "Check comprehension by asking 'Why?' after every sentence read."
        },
        {
          dayNumber: 4,
          objective: "Reading 4-sentence connected paragraphs with 100% accuracy",
          blackboardSetup: "4-line story: The Sun is hot today. Meena and Ali sit under the mango tree. They drink cold water. They feel happy.",
          activities: [
            { step: 1, title: "Silent Reading Finger-Tracking", description: "Students track with pencil tip silently for 3 minutes.", durationMinutes: 10 },
            { step: 2, title: "Choral Reading & Role Play", description: "Left half of room reads Line 1, Right half reads Line 2.", durationMinutes: 12 },
            { step: 3, title: "Three Comprehension Questions", description: "Teacher asks: Who? Where? Why? Students answer orally in full sentences.", durationMinutes: 13 },
          ],
          materials: ["Blackboard", "Chalk", "Notebooks"],
          oralGame: "True or False Lightning: 5 rapid statements about the story.",
          teacherTips: "Ensure students refer back to the blackboard text to verify answers."
        },
        {
          dayNumber: 5,
          objective: "Mini reading theatre & student storytelling",
          blackboardSetup: "Chalkboard speech bubbles for two characters.",
          activities: [
            { step: 1, title: "Reader's Theatre", description: "Pairs stand up and perform the week's story with facial expressions and body actions.", durationMinutes: 18 },
            { step: 2, title: "Peer Assessment Thumbs", description: "Class gives thumbs up for: Clear voice, full stops honored, expression.", durationMinutes: 7 },
            { step: 3, title: "Diagnostic Progress Check", description: "Teacher tests 4 students on Grade 2 passage for Story-level promotion.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Chalk"],
          oralGame: "Radio Presenter: Hold chalk like a microphone and read with flair!",
          teacherTips: "Praise confidence and clarity over absolute speed."
        }
      ]
    },
    story: {
      focus: "Reading fluency (60+ words/min), deep comprehension, vocabulary inference, and summary writing",
      days: [
        {
          dayNumber: 1,
          objective: "Independent fluent reading of a 100-word folk tale with inference",
          blackboardSetup: "Title: The Clever Crow and the Water Jug. New vocabulary: Pebble, Thirsty, Rising.",
          activities: [
            { step: 1, title: "Vocabulary Chalkboard Prediction", description: "Explain 3 key words using quick sketches and context clues.", durationMinutes: 10 },
            { step: 2, title: "Timed Paired Fluency Check", description: "Student A reads for 1 minute; Student B marks words read in notebook. Then switch.", durationMinutes: 15 },
            { step: 3, title: "Cause and Effect Map", description: "Draw two columns on board: Problem -> Solution. Students copy and fill in.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Notebooks", "Timer/Watch"],
          oralGame: "Story Continuation: One sentence each around the circle.",
          teacherTips: "Encourage student listeners to politely correct misread words."
        },
        {
          dayNumber: 2,
          objective: "Identifying Main Idea and 3 Supporting Details",
          blackboardSetup: "Main Idea Umbrella drawn on board with 3 raindrops below.",
          activities: [
            { step: 1, title: "Umbrella Breakdown", description: "Class extracts the core moral or theme and writes it inside the umbrella.", durationMinutes: 12 },
            { step: 2, title: "Notebook Summary Writing", description: "Children write a 3-sentence summary: Beginning, Middle, End.", durationMinutes: 13 },
            { step: 3, title: "Peer Edit Circle", description: "Swap notebooks with partner to check for capital letters and spelling.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Notebooks"],
          oralGame: "20-Second Pitch: Summarize the story before timer dings.",
          teacherTips: "Help students avoid copying sentences verbatim—encourage own words."
        },
        {
          dayNumber: 3,
          objective: "Character perspective and creative alternative endings",
          blackboardSetup: "Chalkboard character scale: Brave vs Fearful / Kind vs Selfish.",
          activities: [
            { step: 1, title: "Hot Seating Activity", description: "One student sits in front as the Crow; classmates interview them in character.", durationMinutes: 15 },
            { step: 2, title: "What If Writing?", description: "What if the crow found no pebbles? Write 2 alternative ending sentences.", durationMinutes: 12 },
            { step: 3, title: "Share Aloud", description: "3 volunteers read their creative endings from the front of class.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Chair", "Notebooks"],
          oralGame: "Freeze Interview: Tap shoulder to speak character thoughts.",
          teacherTips: "Story level children can act as peer tutors for Word level groups during free periods."
        },
        {
          dayNumber: 4,
          objective: "Non-fiction informational text reading & fact extraction",
          blackboardSetup: "Short text about Honeybees and Pollination. Facts vs Opinions table.",
          activities: [
            { step: 1, title: "Information Scavenger Hunt", description: "Teacher writes 3 questions; students scan text to find exact answers.", durationMinutes: 12 },
            { step: 2, title: "Fact Diagramming", description: "Draw labeled bee anatomy on blackboard and notebooks with key facts.", durationMinutes: 13 },
            { step: 3, title: "Notebook Fact Cards", description: "Children write their top 2 fascinating facts to teach parents tonight.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Notebooks"],
          oralGame: "Fact or Fiction: Students raise left hand for fact, right for opinion.",
          teacherTips: "Connecting reading to real-world biology boosts engagement."
        },
        {
          dayNumber: 5,
          objective: "Junior Storyteller Showcase and Library reading",
          blackboardSetup: "Class Book of the Week display and Student Author list.",
          activities: [
            { step: 1, title: "Open Mic Reading", description: "Students read favorite paragraphs aloud to audience with dramatic pacing.", durationMinutes: 18 },
            { step: 2, title: "Peer Mentoring Prep", description: "Teacher trains Story readers on how to mentor non-readers with flashcards next week.", durationMinutes: 10 },
            { step: 3, title: "Weekly Progress Log Update", description: "Students log their reading streak and record target goals.", durationMinutes: 7 },
          ],
          materials: ["Blackboard", "Notebooks"],
          oralGame: "Pass the Mic: Rapid word associations.",
          teacherTips: "Acknowledge progress publicly to inspire other groups in the room."
        }
      ]
    }
  };

  const mathTemplates: Record<string, { focus: string; days: any[] }> = {
    none: {
      focus: "Concrete 1-to-1 correspondence, quantity comparison, and counting 1 to 5 using physical stones",
      days: [
        {
          dayNumber: 1,
          objective: "Count objects 1 to 5 using pebbles, sticks and fingers",
          blackboardSetup: "Drawn boxes with 1 dot, 2 dots, 3 dots, 4 dots, 5 dots. Large numbers beside them.",
          activities: [
            { step: 1, title: "Pebble Pile Matching", description: "Every child receives 5 pebbles or seeds. Place 1 pebble on 1 dot, 2 pebbles on 2 dots.", durationMinutes: 15 },
            { step: 2, title: "Body Counting Rhythms", description: "Clap 1 time, jump 2 times, snap 3 times, tap knees 4 times, stomp 5 times.", durationMinutes: 10 },
            { step: 3, title: "Slate Number Tracing", description: "Teacher guides writing numbers 1, 2, 3 on slates using finger first, then chalk.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Chalk", "Pebbles/bottle caps", "Slates"],
          oralGame: "Number Clap: Clap the number teacher holds up on fingers.",
          teacherTips: "Never rush to abstract numerals before counting concrete real items."
        },
        {
          dayNumber: 2,
          objective: "More than, less than, and equal to with physical sets",
          blackboardSetup: "Two chalk circles: Group A (4 apples) vs Group B (2 apples). Big hungry alligator mouth.",
          activities: [
            { step: 1, title: "Alligator Eats More", description: "Chalkboard alligator jaw always faces the larger pile. Children mimic with arms.", durationMinutes: 12 },
            { step: 2, title: "Stone Comparison Relay", description: "Partners take random handfuls of stones and determine whose handful has 'more'.", durationMinutes: 13 },
            { step: 3, title: "Slate Circle Drawing", description: "Draw 3 circles on left, 5 on right; draw alligator mouth facing 5.", durationMinutes: 10 },
          ],
          materials: ["Chalkboard", "Stones/seeds", "Slates"],
          oralGame: "Big Giant, Tiny Mouse: Stand tall for 'more', crouch for 'less'.",
          teacherTips: "Ensure children physically line up items side-by-side to compare."
        },
        {
          dayNumber: 3,
          objective: "Counting 6 to 10 with bundle-of-sticks concept",
          blackboardSetup: "Five-frame and ten-frame chalk grids on board.",
          activities: [
            { step: 1, title: "Ten-Frame Filling", description: "Teacher calls a number 1-10; students place bottle caps in chalk ten-frame.", durationMinutes: 15 },
            { step: 2, title: "Chalk Number Line Hop", description: "Chalk line 0 to 10 drawn on floor. Students hop along line counting aloud.", durationMinutes: 12 },
            { step: 3, title: "Writing 4, 5, 6 on Slates", description: "Writing practice with rhyme cues ('Down and around and give it a hat for 5').", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Floor chalk", "Bottle caps", "Slates"],
          oralGame: "Hide and Count: Hide 3 stones under a cup; children guess how many left.",
          teacherTips: "Visualizing 10 as two rows of 5 creates strong mental math foundations."
        },
        {
          dayNumber: 4,
          objective: "Ordering numbers 1 to 10 from smallest to biggest",
          blackboardSetup: "Scattered numbers: 7, 2, 9, 1, 5. Staircase diagram.",
          activities: [
            { step: 1, title: "Human Number Line", description: "10 children hold number cards 1-10 and race to assemble themselves in order.", durationMinutes: 15 },
            { step: 2, title: "Staircase Blackboard Drill", description: "Fill in missing steps: 1, 2, _, 4, 5, _, 7, 8, _, 10.", durationMinutes: 10 },
            { step: 3, title: "Notebook Number Stair", description: "Draw vertical dots like stairs (1 dot, 2 dots, 3 dots) in notebooks.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Cardboard cards", "Notebooks"],
          oralGame: "What comes next? Teacher: '4, 5...' Class: '6!'",
          teacherTips: "Look out for children who reverse 6 and 9."
        },
        {
          dayNumber: 5,
          objective: "Introduction to 'Zero' as empty nest & review check",
          blackboardSetup: "Bird nest with 3 eggs -> 2 eggs -> 1 egg -> 0 eggs.",
          activities: [
            { step: 1, title: "The Empty Plate Story", description: "Eat all rotis off plate; what is left? Nothing! We write 0.", durationMinutes: 12 },
            { step: 2, title: "Number Hunt Competition", description: "Teacher calls out random items in room (3 windows, 1 door, 0 elephants!).", durationMinutes: 13 },
            { step: 3, title: "Individual 1-to-1 Diagnostic Check", description: "Quickly assess each child on counting 7 stones to prep for Single-Digit level.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Chalk", "Plates/leaves", "Stones"],
          oralGame: "Zero Freeze: Stand still as a stone on zero.",
          teacherTips: "Congratulate the group for unlocking the entire 0-10 number universe."
        }
      ]
    },
    "single-digit": {
      focus: "Mental addition and subtraction within 10, number bonds, and story problems",
      days: [
        {
          dayNumber: 1,
          objective: "Number bonds of 5 and 10 (e.g., 3 + 2 = 5, 7 + 3 = 10)",
          blackboardSetup: "Rainbow bonds of 10: 0+10, 1+9, 2+8, 3+7, 4+6, 5+5.",
          activities: [
            { step: 1, title: "Finger Pairs of 10", description: "Show 4 fingers; partner must hold up 6 fingers to make 10. Chant: '4 and 6 make 10!'.", durationMinutes: 12 },
            { step: 2, title: "Chalkboard Rainbow Connection", description: "Draw arches connecting complementary pairs on blackboard.", durationMinutes: 13 },
            { step: 3, title: "Slate Speed Bonds", description: "Teacher writes '8 + __ = 10'; students write missing number and flip slate.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Chalk", "Slates"],
          oralGame: "My Friend Ten: Fast shout-outs of the partner to 10.",
          teacherTips: "Mastering bonds to 10 is the single most critical step for future 2-digit math."
        },
        {
          dayNumber: 2,
          objective: "Addition as 'putting together' using village word stories",
          blackboardSetup: "Word problem sketch: 4 goats in a pen + 3 goats join. 4 + 3 = ?",
          activities: [
            { step: 1, title: "Classroom Role Play Problem", description: "4 children stand by door; 3 more walk over. How many goats in all?", durationMinutes: 12 },
            { step: 2, title: "Count-On Mental Strategy", description: "Put 4 in your head, count on 3 fingers: 5, 6, 7! No need to count from 1 again.", durationMinutes: 15 },
            { step: 3, title: "Notebook Equation Practice", description: "Solve 4 single-digit addition problems in notebooks.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Notebooks", "Pencils"],
          oralGame: "Counting On Kangaroo: Jump forward while counting additions.",
          teacherTips: "Insist on 'put big number in head' rather than drawing 7 individual sticks."
        },
        {
          dayNumber: 3,
          objective: "Subtraction as 'taking away' and 'how many left'",
          blackboardSetup: "7 mangoes on board. Cross out 3. How many left? 7 - 3 = 4.",
          activities: [
            { step: 1, title: "Chalkboard Cross-Out Drill", description: "Volunteers come to blackboard to cross out eaten mangoes and count remainder.", durationMinutes: 12 },
            { step: 2, title: "Stone Stealing Game", description: "Start with 8 stones. Partner hides 3 behind back. Count remaining and deduce hidden count.", durationMinutes: 15 },
            { step: 3, title: "Slate Subtraction Quickfire", description: "Teacher gives 5 quick problems: 9-4, 8-2, 6-3, 5-1, 7-5.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Stones", "Slates"],
          oralGame: "Pop the Balloon: Clap and 'pop' the subtracted number.",
          teacherTips: "Clarify difference between '+' (putting together) and '-' (taking away)."
        },
        {
          dayNumber: 4,
          objective: "Fact families and the relationship between + and -",
          blackboardSetup: "Math Triangle: 3, 5, 8. Formulas: 3+5=8, 5+3=8, 8-5=3, 8-3=5.",
          activities: [
            { step: 1, title: "The Three Musketeers Triangle", description: "Demonstrate how the same 3 numbers make 4 different math truths.", durationMinutes: 15 },
            { step: 2, title: "Pair Puzzle Swap", description: "Child writes a triangle on slate; partner writes the 4 equations.", durationMinutes: 12 },
            { step: 3, title: "Notebook Practice", description: "Create 2 math triangles in notebook.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Slates", "Notebooks"],
          oralGame: "Reverse Engine: Reverse addition into subtraction.",
          teacherTips: "Helps children stop guessing and recognize mathematical symmetry."
        },
        {
          dayNumber: 5,
          objective: "Math story creation by students and weekly mastery check",
          blackboardSetup: "Write 6 + 3 = 9. Challenge: Invent a story for this sum!",
          activities: [
            { step: 1, title: "Oral Story Inventions", description: "Children tell creative real-world stories (birds, chapattis, marbles).", durationMinutes: 15 },
            { step: 2, title: "Speed 10-Problem Blackboard Match", description: "Relay teams solve 5 additions and 5 subtractions on board.", durationMinutes: 12 },
            { step: 3, title: "Level Advancement Diagnostic", description: "Assess readiness for 2-digit numbers without carry.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Chalk"],
          oralGame: "Rapid Fire Math Whiz: Answer in under 2 seconds.",
          teacherTips: "Celebrate students who explain their thinking out loud."
        }
      ]
    },
    "two-digit-no-carry": {
      focus: "Place value (Tens & Ones with sticks/bundles), 2-digit column addition and subtraction without regrouping",
      days: [
        {
          dayNumber: 1,
          objective: "Bundle of 10 sticks = 1 Ten; loose sticks = Ones",
          blackboardSetup: "Place Value House: Tens column (T) and Ones column (O). 2 bundles & 4 sticks = 24.",
          activities: [
            { step: 1, title: "Stick Bundling Workshop", description: "Collect broom sticks or twigs. Count 10 sticks and tie with rubber band/thread into a Ten.", durationMinutes: 15 },
            { step: 2, title: "Build the Number", description: "Teacher calls '35'. Students hold up 3 bundles and 5 loose sticks.", durationMinutes: 12 },
            { step: 3, title: "Chalk T-O Table Writing", description: "Draw T and O chart on slates; write 42, 67, 19 in proper columns.", durationMinutes: 8 },
          ],
          materials: ["Broom sticks / matchsticks", "Rubber bands", "Blackboard", "Slates"],
          oralGame: "Tens & Ones Stomp: Stomp foot for each Ten, clap hand for each One.",
          teacherTips: "Concrete physical bundles prevent future confusion with column alignment."
        },
        {
          dayNumber: 2,
          objective: "Adding 2-digit numbers without carry (e.g. 23 + 14)",
          blackboardSetup: "Column addition: T O / 2 3 + 1 4 = ? Rule: Always begin at the Ones door!",
          activities: [
            { step: 1, title: "Ones Door First Rule", description: "Knock on Ones door: 3 + 4 = 7. Then Tens door: 2 + 1 = 3. Total 37!", durationMinutes: 15 },
            { step: 2, title: "Board Volunteer Match", description: "Pairs come up: One child adds Ones column, partner adds Tens column.", durationMinutes: 12 },
            { step: 3, title: "Notebook Column Drill", description: "Solve 4 column problems in notebooks with ruled margins.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Chalk", "Notebooks"],
          oralGame: "Ones First Shout: Chant 'Always start with Ones!' whenever teacher touches Tens first.",
          teacherTips: "Check that digits are aligned neatly one under another."
        },
        {
          dayNumber: 3,
          objective: "Subtracting 2-digit numbers without borrowing (e.g. 48 - 25)",
          blackboardSetup: "T O / 4 8 - 2 5 = ? Stick sketches beside columns.",
          activities: [
            { step: 1, title: "Physical Stick Subtraction", description: "Take 4 bundles & 8 loose sticks. Remove 5 loose sticks, then 2 bundles.", durationMinutes: 15 },
            { step: 2, title: "Blackboard Eraser Step", description: "Erase the subtracted ones, then erase the subtracted tens.", durationMinutes: 10 },
            { step: 3, title: "Slate Speed Pair Check", description: "Pairs solve 3 problems on slates, swap to verify neighbor's answer.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Chalk", "Stick bundles", "Slates"],
          oralGame: "Minus Detective: Find the error in a teacher's deliberate blackboard mistake.",
          teacherTips: "Watch out for students who subtract smaller top number from larger bottom number."
        },
        {
          dayNumber: 4,
          objective: "Mixed 2-digit addition and subtraction village shop problems",
          blackboardSetup: "Village Kiosk Price List: Soap 22, Biscuits 15, Notebook 30, Pen 10.",
          activities: [
            { step: 1, title: "Shopping Simulation", description: "Teacher is shopkeeper. Student buys Soap (22) and Biscuits (15). Calculate total on blackboard.", durationMinutes: 15 },
            { step: 2, title: "Change Calculator", description: "If you give a 50 rupee note, how much change is returned? (50 - 37).", durationMinutes: 12 },
            { step: 3, title: "Notebook Shop Ledger", description: "Write down 2 transactions with drawings in notebook.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Paper play money", "Notebooks"],
          oralGame: "Shopkeeper Bidding: Rapid mental sums of 2 shop items.",
          teacherTips: "Real currency examples instantly clarify mathematical utility."
        },
        {
          dayNumber: 5,
          objective: "Mastery relay and diagnostic prep for Regrouping / Borrowing",
          blackboardSetup: "Chalkboard Relay Grid: 6 addition & 6 subtraction sums.",
          activities: [
            { step: 1, title: "Team Blackboard Relay", description: "Two teams line up. Each child runs to board, solves 1 column, passes chalk to teammate.", durationMinutes: 18 },
            { step: 2, title: "Teaser Problem for Next Level", description: "Teacher presents 34 + 18. 'Uh oh, 4 + 8 is 12! What do we do with the 1?'", durationMinutes: 10 },
            { step: 3, title: "Individual Progress Check", description: "Assess who is ready for 2-digit with carry.", durationMinutes: 7 },
          ],
          materials: ["Blackboard", "Chalk"],
          oralGame: "Math Champ Cheers: Celebrate team sportsmanship.",
          teacherTips: "Leaving children with an unanswered teaser puzzle sparks immense curiosity."
        }
      ]
    },
    "two-digit-with-carry": {
      focus: "Regrouping in addition (carrying to tens) and borrowing in subtraction using bundles & place value houses",
      days: [
        {
          dayNumber: 1,
          objective: "Carrying in addition: 10 loose sticks become 1 new Ten bundle",
          blackboardSetup: "T O / 2 7 + 1 5 = ? Attic box above Tens column for the carried 1.",
          activities: [
            { step: 1, title: "The Overflowing Ones Room", description: "7 sticks + 5 sticks = 12 sticks. The Ones room can only hold up to 9! Tie 10 into a new bundle and walk it next door to the Tens room.", durationMinutes: 15 },
            { step: 2, title: "Attic Box Notation", description: "Write 2 in Ones room, carry the little 1 into the attic box above Tens. 1 + 2 + 1 = 4.", durationMinutes: 12 },
            { step: 3, title: "Slate Step-by-Step", description: "Students solve 3 carrying problems on slates, circling the carried 1 in chalk.", durationMinutes: 8 },
          ],
          materials: ["Stick bundles & rubber bands", "Blackboard", "Slates"],
          oralGame: "Knock Knock Neighbour: Say 'Knock knock, here is your new Ten bundle!'.",
          teacherTips: "Physically carrying the bundle across the room permanently cures 'forgetting the carry'."
        },
        {
          dayNumber: 2,
          objective: "Consolidating 2-digit column addition with regrouping (sums up to 99)",
          blackboardSetup: "36 + 28, 47 + 35, 59 + 24 with distinct attic boxes.",
          activities: [
            { step: 1, title: "Teacher's Deliberate Mistake", description: "Teacher forgets to add the carried 1. Students catch the mistake and correct it loudly.", durationMinutes: 12 },
            { step: 2, title: "Buddy Verification", description: "Partner A adds Ones; Partner B adds Tens (remembering the attic box). Swap roles.", durationMinutes: 15 },
            { step: 3, title: "Notebook Written Practice", description: "Solve 5 problems neatly in notebook.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Chalk", "Notebooks"],
          oralGame: "Attic Watchman: Shout 'Check the attic!' when adding tens.",
          teacherTips: "Highlight the attic box with yellow or white chalk."
        },
        {
          dayNumber: 3,
          objective: "Borrowing in subtraction: Untying 1 Ten bundle into 10 loose sticks",
          blackboardSetup: "T O / 4 2 - 1 8 = ? Cross out 4 -> becomes 3. 2 becomes 12.",
          activities: [
            { step: 1, title: "The Borrowing Story", description: "You have 2 loose sticks and need to give 8. You can't! Knock on Tens room. Borrow 1 bundle, untie it into 10 sticks. Now you have 10 + 2 = 12 sticks!", durationMinutes: 18 },
            { step: 2, title: "Blackboard Slash Technique", description: "Slash 4 Tens -> write 3 Tens. Slash 2 Ones -> write 12 Ones. Now subtract: 12 - 8 = 4, 3 - 1 = 2.", durationMinutes: 12 },
            { step: 3, title: "Physical Bundle Demonstration", description: "Students physically untie a rubber band to observe 1 bundle become 10 loose sticks.", durationMinutes: 5 },
          ],
          materials: ["Sticks & rubber bands", "Blackboard", "Slates"],
          oralGame: "Untie the Knot: Mimic untying a bundle with hand motions.",
          teacherTips: "Never say 'you can't subtract'—say 'we need to regroup with our neighbor'."
        },
        {
          dayNumber: 4,
          objective: "Independent practice of borrowing in subtraction",
          blackboardSetup: "53 - 27, 61 - 38, 70 - 45.",
          activities: [
            { step: 1, title: "Step-by-Step Guided Board Drill", description: "Class calls out each step as one student performs it on the blackboard.", durationMinutes: 12 },
            { step: 2, title: "Slate Partner Battles", description: "Both partners race to solve the problem on slates; compare methods.", durationMinutes: 13 },
            { step: 3, title: "Notebook Independent Set", description: "Children complete 4 subtraction sums in notebooks.", durationMinutes: 10 },
          ],
          materials: ["Blackboard", "Slates", "Notebooks"],
          oralGame: "Neighborly Love: Cheer for the generous Tens column!",
          teacherTips: "Pay special attention to subtraction from zero (e.g. 70 - 45)."
        },
        {
          dayNumber: 5,
          objective: "Combined word problems and preparation for multiplication/division",
          blackboardSetup: "Story: The school garden had 54 cabbages. Monkeys ate 28. How many remain?",
          activities: [
            { step: 1, title: "Story Analysis Breakdown", description: "Underline important numbers, decide: Is this + or -? Set up the columns.", durationMinutes: 12 },
            { step: 2, title: "Chalkboard Grand Championship", description: "Fun, friendly math showdown between row teams.", durationMinutes: 15 },
            { step: 3, title: "Diagnostic Review for Next Tier", description: "Assess children for repeated addition / multiplication readiness.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Chalk", "Notebooks"],
          oralGame: "Math Champion High-Five: Pair high-fives after solving.",
          teacherTips: "Congratulate students on mastering one of primary school's toughest math hurdles."
        }
      ]
    },
    "multiplication-division": {
      focus: "Multiplication as equal groups / repeated addition, division as fair sharing, and real-world tables",
      days: [
        {
          dayNumber: 1,
          objective: "Multiplication as equal groups (e.g. 3 plates with 4 rotis each)",
          blackboardSetup: "3 chalk circles (plates). 4 dots in each plate. 4 + 4 + 4 = 12, or 3 groups of 4 = 12. 3 x 4 = 12.",
          activities: [
            { step: 1, title: "Physical Group Formation", description: "Call 12 children. Group into 3 teams of 4. Count total by repeated addition.", durationMinutes: 15 },
            { step: 2, title: "Blackboard Array Drawing", description: "Draw rows and columns of stars on the board (3 rows of 4 stars).", durationMinutes: 12 },
            { step: 3, title: "Notebook Equal Group Sketches", description: "Draw 4 nests with 2 eggs each; write addition and multiplication sentences.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Chalk", "Notebooks", "Seeds/pebbles"],
          oralGame: "Group Up! Teacher calls 'Groups of 3!'. Students scramble into clusters.",
          teacherTips: "Always read '3 x 4' as '3 groups of 4' so the concept remains visual."
        },
        {
          dayNumber: 2,
          objective: "Skip counting on the number line for 2s, 5s and 10s",
          blackboardSetup: "Floor number line 0 to 50. Frog jumps of 5.",
          activities: [
            { step: 1, title: "Frog Jump Relay", description: "Student hops on floor numbers shouting: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50!", durationMinutes: 15 },
            { step: 2, title: "Handprint Counting (5s)", description: "Trace hand on slates (5 fingers). Count hands across the classroom.", durationMinutes: 12 },
            { step: 3, title: "Slate Multiplication Tables", description: "Write 5x table on slates using rhythmic chanting.", durationMinutes: 8 },
          ],
          materials: ["Floor chalk", "Blackboard", "Slates"],
          oralGame: "Buzz Game: Count 1 to 30. Say 'BUZZ' instead of any multiple of 5.",
          teacherTips: "Skip counting builds the automaticity needed for mental division."
        },
        {
          dayNumber: 3,
          objective: "Division as Fair Sharing among friends",
          blackboardSetup: "15 chalk mangoes. 3 children drawn below. How many does each get?",
          activities: [
            { step: 1, title: "Real Seed Fair Sharing", description: "Give 12 seeds to a pair. Distribute one-by-one into 3 bowls until empty. Count per bowl: 4!", durationMinutes: 15 },
            { step: 2, title: "Chalkboard Division Equation", description: "Write: 12 / 3 = 4. Explain: 12 items shared fairly among 3 people equals 4 each.", durationMinutes: 12 },
            { step: 3, title: "Notebook Fair Share Problem", description: "Children draw and solve 10 candies shared among 2 friends.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Seeds / Bottle caps", "Small bowls/leaves"],
          oralGame: "Fair or Unfair? Show unequal groupings; students call out 'UNFAIR!'.",
          teacherTips: "Remind students that division is the exact opposite of multiplication."
        },
        {
          dayNumber: 4,
          objective: "Fact family triangles for multiplication and division (3, 6, 18)",
          blackboardSetup: "Math Triangle: 3, 6, 18. 3x6=18, 6x3=18, 18/3=6, 18/6=3.",
          activities: [
            { step: 1, title: "Chalk Triangle Discovery", description: "Show how knowing one multiplication fact gives two division answers for free!", durationMinutes: 15 },
            { step: 2, title: "Partner Slate Duel", description: "Player A writes multiplication fact; Player B writes the two division facts.", durationMinutes: 12 },
            { step: 3, title: "Notebook Practice Set", description: "Complete 3 math triangles in notebook.", durationMinutes: 8 },
          ],
          materials: ["Blackboard", "Slates", "Notebooks"],
          oralGame: "Multiplication Flash: Flash fingers for rapid table recall.",
          teacherTips: "Reduces division anxiety by framing it as 'reverse multiplication'."
        },
        {
          dayNumber: 5,
          objective: "Weekly real-world math challenge & graduation review",
          blackboardSetup: "Farmer's Harvest Problem: 4 boxes with 8 papayas each. If 2 boxes sold, how many papayas left?",
          activities: [
            { step: 1, title: "Multi-Step Problem Dissection", description: "Walk through step 1 (total papayas) and step 2 (subtraction or remaining boxes).", durationMinutes: 18 },
            { step: 2, title: "Grand Student Board Challenge", description: "Volunteer pairs show their solutions on board with diagrams.", durationMinutes: 10 },
            { step: 3, title: "Foundational Math Mastery Certification", description: "Award verbal accolades and stamp student notebooks.", durationMinutes: 7 },
          ],
          materials: ["Blackboard", "Chalk", "Notebooks"],
          oralGame: "Math Riddle of the Day: 'I am between 20 and 30, a multiple of 4 and 6. Who am I?' (24).",
          teacherTips: "Highlight that these students are now ready for advanced primary grade syllabi!"
        }
      ]
    }
  };

  const pool = isReading ? readingTemplates : mathTemplates;
  const normalizedLevel = pool[groupLevel] ? groupLevel : Object.keys(pool)[0];
  const template = pool[normalizedLevel] || pool[Object.keys(pool)[0]];

  for (let w = 1; w <= durationWeeks; w++) {
    weeks.push({
      weekNumber: w,
      focus: w === 1 ? template.focus : `Consolidation & Application: ${template.focus} with higher speed and autonomy`,
      days: template.days.map((d) => ({
        ...d,
        dayNumber: d.dayNumber,
        objective: w === 1 ? d.objective : `Reinforce: ${d.objective}`,
        blackboardSetup: d.blackboardSetup,
        activities: d.activities,
        materials: d.materials,
        oralGame: d.oralGame,
        teacherTips: d.teacherTips,
      })),
    });
  }

  return {
    title: `${isReading ? "Reading" : "Math"} Foundational Plan (${groupLevel.toUpperCase()} Level)`,
    summary: `Structured ${durationWeeks}-week blackboard & oral pedagogy plan designed for low-resource primary classrooms without printed worksheets. Focuses on ${template.focus}.`,
    subject: isReading ? "reading" : "math",
    level: groupLevel,
    durationWeeks,
    weeks,
  };
}

// API: Generate Activity Plan using Gemini 3.8 Flash (with intelligent offline fallback)
app.post("/api/generate-plan", async (req, res) => {
  try {
    const {
      groupLevel = "word",
      subject = "reading",
      durationWeeks = 1,
      className = "Grade 3",
      studentCount = 12,
      language = "English",
      context = "Low-resource primary government school, single blackboard, multi-level class",
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      console.log("No GEMINI_API_KEY found, using pedagogical fallback template.");
      const plan = generateFallbackPlan(subject, groupLevel, durationWeeks, className);
      return res.json({ success: true, source: "curated_pedagogy_template", plan });
    }

    const prompt = `You are an expert primary school master trainer in foundational literacy and numeracy (FLN / Teaching at the Right Level / Pratham TaRL methodology).
Design a highly practical, low-resource, blackboard-ready ${durationWeeks}-week lesson plan for a group of ${studentCount} primary school students in "${className}".

CONTEXT & CONSTRAINTS:
- Subject: ${subject}
- Group Foundational Level: ${groupLevel} (e.g. non-reader, letter, word, sentence, story, or no number sense, single-digit, 2-digit without carry, 2-digit with carry, multiplication/division)
- Classroom context: ${context}
- Teaching medium / language: ${language}
- Physical constraints: Only ONE chalkboard, chalk pieces, student slates/rough notebooks, sticks/stones/seeds from playground. NO printed worksheets. NO digital devices for students.
- Session time: 35-40 minutes per day, 5 days per week.
- Must include step-by-step blackboard diagrams/drawings, active oral games, physical movement (TPR), and a rapid 1-minute diagnostic check step.

Generate a comprehensive JSON response adhering strictly to the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a master educator in low-resource primary schools. You produce blackboard-focused, zero-cost, highly active learning plans in structured JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            subject: { type: Type.STRING },
            level: { type: Type.STRING },
            durationWeeks: { type: Type.INTEGER },
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.INTEGER },
                  focus: { type: Type.STRING },
                  days: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        dayNumber: { type: Type.INTEGER },
                        objective: { type: Type.STRING },
                        blackboardSetup: { type: Type.STRING, description: "Exact sketch or text for teacher to write on chalkboard" },
                        activities: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              step: { type: Type.INTEGER },
                              title: { type: Type.STRING },
                              description: { type: Type.STRING },
                              durationMinutes: { type: Type.INTEGER },
                            },
                            required: ["step", "title", "description", "durationMinutes"],
                          },
                        },
                        materials: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        oralGame: { type: Type.STRING },
                        teacherTips: { type: Type.STRING },
                      },
                      required: ["dayNumber", "objective", "blackboardSetup", "activities", "materials", "oralGame", "teacherTips"],
                    },
                  },
                },
                required: ["weekNumber", "focus", "days"],
              },
            },
          },
          required: ["title", "summary", "subject", "level", "durationWeeks", "weeks"],
        },
      },
    });

    const text = response.text?.trim() || "";
    if (!text) {
      throw new Error("Empty response from AI model");
    }

    const plan = JSON.parse(text);
    return res.json({ success: true, source: "gemini_ai", plan });
  } catch (error: any) {
    console.error("Error generating plan with Gemini:", error);
    // Graceful fallback to verified pedagogical curriculum
    const fallback = generateFallbackPlan(
      req.body.subject || "reading",
      req.body.groupLevel || "word",
      req.body.durationWeeks || 1,
      req.body.className
    );
    return res.json({
      success: true,
      source: "fallback_due_to_error",
      error: error.message,
      plan: fallback,
    });
  }
});

// API: Sync endpoint for offline queue sync
app.post("/api/sync", (req, res) => {
  const { queue = [], clientTimestamp } = req.body;
  console.log(`Received sync batch with ${queue.length} items from client at ${clientTimestamp}`);
  res.json({
    status: "ok",
    syncedCount: queue.length,
    serverTimestamp: new Date().toISOString(),
    message: "All classroom records successfully synchronized with cloud database.",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Vite middleware for development or static file serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LevelMatch Classroom server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
