import { pgTable, text, timestamp, boolean, integer, date } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text("id").primaryKey(), // do4ZraXJKH6aUD5VBmK2eyfCAI7qbYWk
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    role: text('role', { enum: ["user", "admin"] }).notNull().default("user"),
    emailVerified: boolean("email_verified")
        .$defaultFn(() => false)
        .notNull(),
    image: text("image"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Extended donor profile information
export const donorProfile = pgTable("donor_profile", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    phone: text("phone"),
    address: text("address"),
    city: text("city"),
    bloodGroup: text("blood_group", {
        enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]
    }),
    dateOfBirth: date("date_of_birth"),
    weight: integer("weight"), // in kg
    lastDonationDate: date("last_donation_date"),
    isEligible: boolean("is_eligible").default(true).notNull(),
    medicalNotes: text("medical_notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Emergency contact information
export const emergencyContact = pgTable("emergency_contact", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    relationship: text("relationship").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
        mode: "date",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// Donation records
export const donation = pgTable("donation", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    donationType: text("donation_type", {
        enum: ["blood", "plasma", "platelets", "double_red"]
    }).notNull().default("blood"),
    location: text("location").notNull(),
    donationDate: date("donation_date").notNull(),
    hemoglobinLevel: text("hemoglobin_level"), // e.g., "12.5 g/dL"
    bloodPressure: text("blood_pressure"), // e.g., "120/80"
    weight: integer("weight"), // weight at time of donation in kg
    notes: text("notes"),
    status: text("status", {
        enum: ["completed", "deferred", "cancelled"]
    }).notNull().default("completed"),
    processedBy: text("processed_by"), // admin user who processed
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Appointment bookings
export const appointment = pgTable("appointment", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    appointmentDate: date("appointment_date").notNull(),
    appointmentTime: text("appointment_time").notNull(), // e.g., "09:30"
    donationType: text("donation_type", {
        enum: ["blood", "plasma", "platelets", "double_red"]
    }).notNull().default("blood"),
    location: text("location").notNull(),
    status: text("status", {
        enum: ["scheduled", "confirmed", "completed", "cancelled", "no_show"]
    }).notNull().default("scheduled"),
    notes: text("notes"),
    reminderSent: boolean("reminder_sent").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
