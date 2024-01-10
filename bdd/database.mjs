/** 
 * 
 * this is a typescript file 
 * 
 * where we check if our sqllite database tables are created or need to be created / updated
 * 
*/
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';

// export default setupDatabase
export async function setupDatabase(cb) {
    // if it's not there, create it

    let db;
    try {
        let result = await open({
            filename: './database.sqlite',
            driver: sqlite3.verbose().Database
        });
        db = result;
    }catch(e){
        console.error(e);
        return;
    }
    // 

    //await db.migrate({ force: 'last' });

    // projects (id, name, description) // have many features
    // features (id, name, description, project_id)
    // scenarios (id, feature_id, name, description)
    // steps (id, scenario_id, type, description)
    // taggable_tags (id, taggable_id, taggable_type, tag_id)
    // tags (id, name)
    // users (id, email, password, verification_token, verified, reset_token, reset_token_expires_at, created_at, updated_at)
    
    await db.exec(`
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
);
`)
    
    
    await db.exec(`
CREATE TABLE IF NOT EXISTS features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    project_id INTEGER,
    FOREIGN KEY(project_id) REFERENCES projects(id)
);
`);

    await db.exec(`
CREATE TABLE IF NOT EXISTS scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feature_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tags TEXT,
    FOREIGN KEY(feature_id) REFERENCES features(id)
);
`);

    await db.exec(`
CREATE TABLE IF NOT EXISTS steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY(scenario_id) REFERENCES scenarios(id)
);
`);

    await db.exec(`
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);
`);

    await db.exec(`
CREATE TABLE IF NOT EXISTS taggable_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taggable_id INTEGER NOT NULL,
    taggable_type TEXT NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY(taggable_id) REFERENCES scenarios(id),
    FOREIGN KEY(tag_id) REFERENCES tags(id)
);
`);

    await db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    verification_token TEXT,
    verified INTEGER NOT NULL,
    reset_token TEXT,
    reset_token_expires_at TEXT,
    created_at TEXT,
    updated_at TEXT
);
`);
    
    // verify a mail@jakedowns.com user is in the db, if not insert me
    const user = await db.get('SELECT * FROM users WHERE email = ?', 'mail@jakedowns.com');
    if (!user) {
        await db.run(`
INSERT INTO users (email, password, verified, created_at, updated_at)
VALUES (?, ?, ?, ?, ?)
`, 'mail@jakedowns.com', 'password', 1, new Date().toISOString(), new Date().toISOString());
    }


    // give it back
    cb(db);
}