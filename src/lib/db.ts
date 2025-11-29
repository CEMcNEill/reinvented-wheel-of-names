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

export { db };
