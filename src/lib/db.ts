import Dexie, { type EntityTable } from 'dexie';

export interface TeamMember {
    id: string;
    name: string;
    avatarUrl?: string;
}

export interface Team {
    id: string;
    name: string;
    members: TeamMember[];
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const db = new Dexie('WheelOfNamesDB') as Dexie & {
    teams: EntityTable<
        Team,
        'id' // primary key "id" (for the typings only)
    >;
};

// Schema declaration:
db.version(1).stores({
    teams: 'id, name, createdAt, updatedAt' // primary key "id" (for the runtime!)
});

// Version 2: Add order
db.version(2).stores({
    teams: 'id, name, order, createdAt, updatedAt'
});

export { db };
