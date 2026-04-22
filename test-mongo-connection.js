#!/usr/bin/env node

// Test MongoDB connection for session store
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

console.log('🧪 Testing MongoDB Connection for Session Store');
console.log('================================================');
console.log('');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment!');
    process.exit(1);
}

console.log('📝 MongoDB URI:', MONGODB_URI.replace(/:[^:@]+@/, ':***@'));
console.log('');

// Test 1: Direct Mongoose connection
console.log('1️⃣ Testing direct Mongoose connection...');
mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
})
.then(() => {
    console.log('✅ Mongoose connected successfully');
    console.log('');
    
    // Test 2: Create MongoStore
    console.log('2️⃣ Testing MongoStore creation...');
    try {
        const sessionStore = MongoStore.create({
            mongoUrl: MONGODB_URI,
            touchAfter: 24 * 3600,
            ttl: 24 * 60 * 60,
            autoRemove: 'native',
            crypto: {
                secret: process.env.SESSION_SECRET || 'test-secret'
            },
            mongoOptions: {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 10000,
            }
        });
        
        console.log('✅ MongoStore created successfully');
        console.log('');
        
        // Listen for store events
        sessionStore.on('error', (error) => {
            console.error('❌ Session store error:', error);
        });
        
        sessionStore.on('create', (sessionId) => {
            console.log('✅ Session created:', sessionId);
        });
        
        sessionStore.on('touch', (sessionId) => {
            console.log('✅ Session touched:', sessionId);
        });
        
        sessionStore.on('destroy', (sessionId) => {
            console.log('✅ Session destroyed:', sessionId);
        });
        
        console.log('3️⃣ Testing session store operations...');
        
        // Test set
        const testSession = {
            cookie: { maxAge: 3600000 },
            isAuthenticated: true,
            userEmail: 'test@example.com',
            role: 'admin'
        };
        
        sessionStore.set('test-session-id', testSession, (err) => {
            if (err) {
                console.error('❌ Session set failed:', err);
                process.exit(1);
            }
            
            console.log('✅ Session set successful');
            
            // Test get
            sessionStore.get('test-session-id', (err, session) => {
                if (err) {
                    console.error('❌ Session get failed:', err);
                    process.exit(1);
                }
                
                if (session && session.isAuthenticated) {
                    console.log('✅ Session get successful');
                    console.log('   Retrieved session:', JSON.stringify(session, null, 2));
                    
                    // Test destroy
                    sessionStore.destroy('test-session-id', (err) => {
                        if (err) {
                            console.error('❌ Session destroy failed:', err);
                            process.exit(1);
                        }
                        
                        console.log('✅ Session destroy successful');
                        console.log('');
                        console.log('================================================');
                        console.log('✅ ALL TESTS PASSED!');
                        console.log('   MongoStore is working correctly.');
                        console.log('================================================');
                        
                        process.exit(0);
                    });
                } else {
                    console.error('❌ Session data not retrieved correctly');
                    process.exit(1);
                }
            });
        });
        
    } catch (error) {
        console.error('❌ MongoStore creation failed:', error);
        process.exit(1);
    }
    
})
.catch((err) => {
    console.error('❌ Mongoose connection failed:', err.message);
    process.exit(1);
});

// Timeout after 30 seconds
setTimeout(() => {
    console.error('❌ Test timed out after 30 seconds');
    process.exit(1);
}, 30000);
