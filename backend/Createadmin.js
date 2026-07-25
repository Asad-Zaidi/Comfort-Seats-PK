require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const Admin = require('./models/Admin');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

const getCredentials = async () => {
    // If env vars are provided, skip the interactive prompt entirely (useful for scripted setups)
    if (process.env.ADMIN_NAME && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        return {
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: process.env.ADMIN_ROLE || 'admin'
        };
    }

    console.log('--- Create Admin User ---');
    const name = await ask('Name: ');
    const email = await ask('Email: ');
    const password = await ask('Password (min 6 characters): ');
    const roleInput = await ask('Role [admin] (default: admin): ');

    return {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: ['admin'].includes(roleInput.trim()) ? roleInput.trim() : 'admin'
    };
};

const createAdmin = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!uri) {
            console.error('Error: MONGODB_URI or MONGO_URI is not set in your environment/.env file.');
            process.exit(1);
        }

        const { name, email, password, role } = await getCredentials();
        rl.close();

        if (!name || !email || !password) {
            console.error('Error: name, email, and password are all required.');
            process.exit(1);
        }

        if (password.length < 6) {
            console.error('Error: password must be at least 6 characters.');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB.');

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            console.error(`Error: an admin with the email "${email}" already exists.`);
            await mongoose.disconnect();
            process.exit(1);
        }

        const admin = new Admin({ name, email, password, role });
        await admin.save(); // password gets hashed automatically via the pre('save') hook

        console.log('\n✅ Admin user created successfully:');
        console.log(`   Name:  ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role:  ${admin.role}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        try { await mongoose.disconnect(); } catch (_) { }
        process.exit(1);
    }
};

createAdmin();