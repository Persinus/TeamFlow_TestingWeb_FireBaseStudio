

import mongoose from 'mongoose';
import { User as UserModel, Team as TeamModel, Task as TaskModel } from '@/lib/models';
import { MOCK_USERS } from '@/lib/mock-data';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from exploding during
 * local development.
 */
// @ts-ignore
let cached = global.mongoose;

if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null };
}

// --- Database Seeding ---
const seedDatabase = async () => {
    // Using a separate connection for seeding to avoid conflicts
    const conn = mongoose.createConnection(MONGODB_URI!);
    const UserSeedModel = conn.model('User', UserModel.schema);
    const TeamSeedModel = conn.model('Team', TeamModel.schema);
    const TaskSeedModel = conn.model('Task', TaskModel.schema);

    try {
        const userCount = await UserSeedModel.countDocuments();
        if (userCount > 0) {
            console.log('Database already seeded.');
            await conn.close();
            return;
        }

        console.log('Seeding database...');
        
        // 1. Insert all mock users with their specific IDs
        const usersToCreate = MOCK_USERS.map(({ id, ...rest }) => ({ ...rest, _id: id }));
        await UserSeedModel.insertMany(usersToCreate);
        console.log(`${MOCK_USERS.length} users created.`);

        // 2. Create a default team
        const justiceLeagueTeam = new TeamSeedModel({
            _id: 'team-justice-league-1',
            name: 'Justice League',
            description: 'The world\'s premier superhero team.',
            members: [
                { user: 'user-bruce', role: 'leader' },
                { user: 'user-clark', role: 'member' },
                { user: 'user-diana', role: 'member' },
            ],
        });
        await justiceLeagueTeam.save();
        console.log('Justice League team created.');
        
        // 3. Create some tasks for the team
        const tasksToCreate = [
            {
                _id: 'task-1',
                title: 'Design new Batmobile schematics',
                description: 'Upgrade the Batmobile with the latest tech. Focus on stealth and non-lethal weaponry.',
                status: 'in-progress',
                assignee: 'user-bruce',
                team: justiceLeagueTeam._id,
                tags: ['design', 'engineering'],
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            },
            {
                _id: 'task-2',
                title: 'Interview Lex Luthor for Daily Planet',
                description: 'Get an exclusive interview with Lex Luthor about his recent "philanthropic" activities.',
                status: 'todo',
                assignee: 'user-clark',
                team: justiceLeagueTeam._id,
                tags: ['journalism', 'investigation'],
                 dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            },
            {
                _id: 'task-3',
                title: 'Translate ancient Amazonian texts',
                description: 'Translate the scrolls recovered from Themyscira to uncover potential threats.',
                status: 'todo',
                assignee: 'user-diana',
                team: justiceLeagueTeam._id,
                tags: ['research', 'translation'],
            }
        ];
        await TaskSeedModel.insertMany(tasksToCreate);
        console.log(`${tasksToCreate.length} tasks created.`);
        
        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw new Error('Database seeding failed.');
    } finally {
        // Ensure the temporary connection is closed
        await conn.close();
    }
};


async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(async (mongoose) => {
      // Seed the database only if the connection is new and successful
      await seedDatabase();
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
