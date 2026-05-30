require('dotenv').config();
const mongoose   = require('mongoose');
const User       = require('./models/User');
const Discussion = require('./models/Discussion');
const Comment    = require('./models/Comment');
const Message    = require('./models/Message');

const DEMO_USERS = [
  { username: 'demo_user',    email: 'demo@forum.com',  password: 'demo1234',  role: 'user',      bio: 'Just a regular forum member exploring discussions.' },
  { username: 'admin_alex',   email: 'admin@forum.com', password: 'admin1234', role: 'admin',     bio: 'Forum admin. Here to keep things running smoothly.' },
  { username: 'mod_maya',     email: 'mod@forum.com',   password: 'mod1234',   role: 'moderator', bio: 'Moderator. Happy to help with any issues!' },
  { username: 'dev_ravi',     email: 'ravi@forum.com',  password: 'ravi1234',  role: 'user',      bio: 'Full-stack dev. Loves React and Node.js.' },
  { username: 'design_priya', email: 'priya@forum.com', password: 'priya1234', role: 'user',      bio: 'UI/UX designer. Figma enthusiast.' },
];

async function clearData(userIds) {
  await Message.deleteMany({ sender: { $in: userIds } });
  await Comment.deleteMany({ author: { $in: userIds } });
  await Discussion.deleteMany({ author: { $in: userIds } });
  await User.updateMany({ _id: { $in: userIds } }, { discussions: [] });
  console.log('🗑️  Cleared old seed data');
}

async function seedUsers() {
  const users = [];
  for (const u of DEMO_USERS) {
    let user = await User.findOne({ email: u.email });
    if (user) {
      console.log(`👤 Resetting password for ${u.username}`);
      user.password = u.password;
      user.bio = u.bio;
      await user.save();
    } else {
      user = await User.create({
        username: u.username,
        email: u.email,
        password: u.password,
        role: u.role,
        bio: u.bio,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`,
      });
      console.log(`✅ Created user → ${u.username}`);
    }
    users.push(user);
  }
  return users;
}

async function seedDiscussions(users) {
  const [demo, admin, mod, ravi, priya] = users;

  const discussions = await Discussion.insertMany([
    {
      title: 'Welcome to the Community Forum — Read First!',
      content: 'Welcome everyone! This is your go-to place for discussions, help, and showcasing your projects. Please read the community guidelines before posting. Be respectful, stay on topic, and have fun!',
      author: admin._id,
      category: 'announcement',
      tags: ['welcome', 'rules', 'guidelines'],
      isPinned: true,
      views: 342,
    },
    {
      title: 'How do I center a div in CSS?',
      content: 'I know this is a classic question but I keep forgetting. What are the best modern ways to center a div both horizontally and vertically? I have tried margin: auto but it only centers horizontally. Please help!',
      author: demo._id,
      category: 'help',
      tags: ['css', 'html', 'frontend', 'beginner'],
      views: 128,
    },
    {
      title: 'Tips for learning Data Structures and Algorithms',
      content: 'I have been struggling with DSA for a while now. Arrays and strings are fine but once I get to trees and graphs my brain just melts. Any advice on resources, study schedules, or approaches that worked for you? I have a placement interview in 3 months.',
      author: demo._id,
      category: 'help',
      tags: ['dsa', 'algorithms', 'interview', 'learning'],
      views: 176,
    },
    {
      title: 'What tools do you use for time management as a developer?',
      content: 'Between coding, meetings, learning new things, and personal projects, I always feel overwhelmed. What tools or techniques do you use to stay productive and manage your time effectively?',
      author: demo._id,
      category: 'general',
      tags: ['productivity', 'tools', 'time-management'],
      views: 94,
    },
    {
      title: 'Built my first full-stack app with React and Node.js',
      content: 'Hey everyone! I just finished building my first full-stack application using React for the frontend and Node.js/Express for the backend with MongoDB. It is a simple todo app but I learned so much about REST APIs, authentication with JWT, and connecting the frontend to the backend.',
      author: ravi._id,
      category: 'showcase',
      tags: ['react', 'nodejs', 'mongodb', 'fullstack'],
      views: 89,
    },
    {
      title: 'What is your favourite VS Code extension in 2025?',
      content: 'I am always looking to improve my dev setup. What VS Code extensions do you swear by? I currently use Prettier, ESLint, and GitLens. Looking for hidden gems I might have missed!',
      author: priya._id,
      category: 'general',
      tags: ['vscode', 'tools', 'productivity'],
      views: 215,
    },
    {
      title: 'Off-topic: What dev memes are living rent-free in your head?',
      content: 'Let us lighten the mood. Share your favourite programming memes or jokes. I will start: "It works on my machine" — should we just ship the machine?',
      author: mod._id,
      category: 'offtopic',
      tags: ['memes', 'fun', 'offtopic'],
      views: 301,
    },
  ]);

  // Link discussions back to user.discussions array
  const demoDiscussions = discussions.filter(d => d.author.equals(demo._id));
  const adminDiscussions = discussions.filter(d => d.author.equals(admin._id));
  const raviDiscussions = discussions.filter(d => d.author.equals(ravi._id));
  const priyaDiscussions = discussions.filter(d => d.author.equals(priya._id));
  const modDiscussions = discussions.filter(d => d.author.equals(mod._id));

  await User.findByIdAndUpdate(demo._id,  { discussions: demoDiscussions.map(d => d._id) });
  await User.findByIdAndUpdate(admin._id, { discussions: adminDiscussions.map(d => d._id) });
  await User.findByIdAndUpdate(ravi._id,  { discussions: raviDiscussions.map(d => d._id) });
  await User.findByIdAndUpdate(priya._id, { discussions: priyaDiscussions.map(d => d._id) });
  await User.findByIdAndUpdate(mod._id,   { discussions: modDiscussions.map(d => d._id) });

  console.log(`✅ Seeded ${discussions.length} discussions`);
  return discussions;
}

async function seedComments(users, discussions) {
  const [demo, admin, mod, ravi, priya] = users;
  const [announcement, cssHelp, dsa, timeManagement, showcase, vscode, memes] = discussions;

  const comments = await Comment.insertMany([
    // CSS help
    { content: 'Use flexbox! Just add display flex with justify-content center and align-items center to the parent. Works every time.', author: ravi._id, discussion: cssHelp._id },
    { content: 'CSS Grid also works great with place-items center — super clean one-liner!', author: priya._id, discussion: cssHelp._id },
    { content: 'Both answers above are correct. Flexbox is great for 1D layouts, Grid for 2D. Either works for centering!', author: mod._id, discussion: cssHelp._id },
    { content: 'place-items center is so clean, I never knew that existed. Thank you all so much!', author: demo._id, discussion: cssHelp._id },
    // DSA
    { content: 'Start with Striver\'s A2Z DSA sheet — structured really well with video explanations for every problem.', author: ravi._id, discussion: dsa._id },
    { content: 'For trees specifically, draw them on paper before coding. Visualising really helps with recursion.', author: priya._id, discussion: dsa._id },
    { content: 'Consistency beats intensity. 2-3 problems per day is better than doing 20 in one day and burning out.', author: mod._id, discussion: dsa._id },
    // Time management
    { content: 'I use Notion for everything — tasks, notes, project planning. Took a week to set up but worth it.', author: ravi._id, discussion: timeManagement._id },
    { content: 'Pomodoro technique changed my life. 25 minutes of focused work then 5 minute break.', author: priya._id, discussion: timeManagement._id },
    // Showcase
    { content: 'This is awesome for a first full-stack app! Did you deploy it anywhere?', author: demo._id, discussion: showcase._id },
    { content: 'Great work! Make sure to add input validation on the backend too — never trust the frontend alone.', author: mod._id, discussion: showcase._id },
    { content: 'Thanks everyone! Deployed it on Render free tier. Will share the link soon!', author: ravi._id, discussion: showcase._id },
    // VS Code
    { content: 'Error Lens is amazing — shows errors inline instead of just underlining. Game changer!', author: ravi._id, discussion: vscode._id },
    { content: 'Thunder Client for API testing without leaving VS Code. Replaced Postman for me entirely!', author: demo._id, discussion: vscode._id },
    { content: 'Peacock colours your VS Code window differently per project. Super helpful with multiple windows open.', author: admin._id, discussion: vscode._id },
    // Memes
    { content: 'There are only 2 hard problems in CS: cache invalidation, naming things, and off-by-one errors.', author: ravi._id, discussion: memes._id },
    { content: 'Senior dev says 2 weeks. Junior dev says 2 days. 3 weeks later... both are still debugging.', author: demo._id, discussion: memes._id },
  ]);

  // Link comments to discussions
  await Discussion.findByIdAndUpdate(cssHelp._id,        { comments: comments.slice(0, 4).map(c => c._id) });
  await Discussion.findByIdAndUpdate(dsa._id,            { comments: comments.slice(4, 7).map(c => c._id) });
  await Discussion.findByIdAndUpdate(timeManagement._id, { comments: comments.slice(7, 9).map(c => c._id) });
  await Discussion.findByIdAndUpdate(showcase._id,       { comments: comments.slice(9, 12).map(c => c._id) });
  await Discussion.findByIdAndUpdate(vscode._id,         { comments: comments.slice(12, 15).map(c => c._id) });
  await Discussion.findByIdAndUpdate(memes._id,          { comments: comments.slice(15, 17).map(c => c._id) });

  console.log(`✅ Seeded ${comments.length} comments`);
}

async function seedMessages(users, discussions) {
  const [demo, admin, mod, ravi, priya] = users;
  const [, cssHelp,, , showcase,, ] = discussions;

  await Message.insertMany([
    { content: 'Hey is anyone online? I have a CSS question', sender: demo._id, room: `room_${cssHelp._id}` },
    { content: 'Yeah what is up?', sender: ravi._id, room: `room_${cssHelp._id}` },
    { content: 'How do I make a sticky navbar that hides on scroll down?', sender: demo._id, room: `room_${cssHelp._id}` },
    { content: 'You need a scroll event listener in JS plus CSS transition. Want me to paste the code?', sender: ravi._id, room: `room_${cssHelp._id}` },
    { content: 'Yes please!', sender: demo._id, room: `room_${cssHelp._id}` },
    { content: 'Congrats on the project Ravi!', sender: mod._id, room: `room_${showcase._id}` },
    { content: 'Thanks! It was tough but I learned so much', sender: ravi._id, room: `room_${showcase._id}` },
    { content: 'What database are you using?', sender: priya._id, room: `room_${showcase._id}` },
    { content: 'MongoDB with Mongoose. Thinking of trying PostgreSQL next', sender: ravi._id, room: `room_${showcase._id}` },
    { content: 'Nice! Let us know how it goes', sender: admin._id, room: `room_${showcase._id}` },
  ]);

  console.log('✅ Seeded chat messages');
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🔗 Connected to MongoDB\n');

  const users = await seedUsers();
  await clearData(users.map(u => u._id));
  const discussions = await seedDiscussions(users);
  await seedComments(users, discussions);
  await seedMessages(users, discussions);

  console.log('\n─────────────────────────────────────────────');
  console.log('🎉 Seed complete! Demo login credentials:');
  console.log('');
  console.log('   👤 Regular User  →  demo@forum.com   /  demo1234  (3 discussions)');
  console.log('   🛡️  Moderator     →  mod@forum.com    /  mod1234');
  console.log('   👑 Admin         →  admin@forum.com  /  admin1234');
  console.log('─────────────────────────────────────────────\n');

  await mongoose.disconnect();
}

seed().catch(console.error);