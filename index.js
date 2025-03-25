// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  institutions;
  rankings;
  announcements;
  userId;
  institutionId;
  rankingId;
  announcementId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.institutions = /* @__PURE__ */ new Map();
    this.rankings = /* @__PURE__ */ new Map();
    this.announcements = /* @__PURE__ */ new Map();
    this.userId = 1;
    this.institutionId = 1;
    this.rankingId = 1;
    this.announcementId = 1;
    this.seedAnnouncements();
    this.seedInstitutions();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Institution methods
  async getInstitutions() {
    return Array.from(this.institutions.values());
  }
  async getInstitution(id) {
    return this.institutions.get(id);
  }
  async createInstitution(institution) {
    const id = this.institutionId++;
    const newInstitution = { ...institution, id };
    this.institutions.set(id, newInstitution);
    return newInstitution;
  }
  // Ranking methods
  async getRankings(filters) {
    const rankingsArray = Array.from(this.rankings.values());
    let filteredRankings = rankingsArray;
    if (filters) {
      if (filters.year) {
        filteredRankings = filteredRankings.filter((r) => r.year === filters.year);
      }
      if (filters.category) {
        filteredRankings = filteredRankings.filter((r) => r.category === filters.category);
      }
    }
    const rankingsWithInstitutions = filteredRankings.map((ranking) => {
      const institution = this.institutions.get(ranking.institutionId);
      if (!institution) {
        throw new Error(`Institution with ID ${ranking.institutionId} not found`);
      }
      if (institution.state !== "Andhra Pradesh" && institution.state !== "Telangana") {
        return null;
      }
      if (filters?.institutionType && institution.type !== filters.institutionType) {
        return null;
      }
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!institution.name.toLowerCase().includes(searchTerm) && !institution.city.toLowerCase().includes(searchTerm) && !institution.state.toLowerCase().includes(searchTerm)) {
          return null;
        }
      }
      return { ...ranking, institution };
    }).filter(Boolean);
    return rankingsWithInstitutions.sort((a, b) => a.rank - b.rank);
  }
  async getRanking(id) {
    return this.rankings.get(id);
  }
  async createRanking(ranking) {
    const id = this.rankingId++;
    const newRanking = {
      ...ranking,
      id,
      // Set default values for the fields if they're not provided
      ssScore: ranking.ssScore ?? null,
      fsrScore: ranking.fsrScore ?? null,
      fqeScore: ranking.fqeScore ?? null,
      fruScore: ranking.fruScore ?? null,
      puScore: ranking.puScore ?? null,
      qpScore: ranking.qpScore ?? null,
      iprScore: ranking.iprScore ?? null,
      fpppScore: ranking.fpppScore ?? null,
      gphScore: ranking.gphScore ?? null,
      gueScore: ranking.gueScore ?? null,
      msScore: ranking.msScore ?? null,
      gphdScore: ranking.gphdScore ?? null,
      rdScore: ranking.rdScore ?? null,
      wdScore: ranking.wdScore ?? null,
      escsScore: ranking.escsScore ?? null,
      pcsScore: ranking.pcsScore ?? null
    };
    this.rankings.set(id, newRanking);
    return newRanking;
  }
  async bulkCreateRankings(rankings2) {
    const createdRankings = [];
    for (const ranking of rankings2) {
      const newRanking = await this.createRanking(ranking);
      createdRankings.push(newRanking);
    }
    return createdRankings;
  }
  // Announcement methods
  async getAnnouncements() {
    return Array.from(this.announcements.values()).filter((a) => a.isActive === 1).sort((a, b) => b.id - a.id);
  }
  async createAnnouncement(announcement) {
    const id = this.announcementId++;
    const newAnnouncement = {
      ...announcement,
      id,
      isActive: announcement.isActive || 1
      // Ensure isActive has a value
    };
    this.announcements.set(id, newAnnouncement);
    return newAnnouncement;
  }
  // Seed data methods
  seedAnnouncements() {
    const announcements2 = [
      {
        text: "NIRF Rankings 2023 released on September 10, 2023 by Honorable Minister of Education.",
        isActive: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        text: "Data submission for NIRF 2024 will open in December 2023. Stay tuned for updates.",
        isActive: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        text: "Webinars on NIRF methodology scheduled for November 15-20, 2023.",
        isActive: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        text: "Special ranking insights for Andhra Pradesh and Telangana institutions now available.",
        isActive: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    announcements2.forEach((a) => {
      this.createAnnouncement(a);
    });
  }
  seedInstitutions() {
    const institutions2 = [
      // Andhra Pradesh Institutions
      { name: "Indian Institute of Technology Tirupati", city: "Tirupati", state: "Andhra Pradesh", type: "Public" },
      { name: "Andhra University", city: "Visakhapatnam", state: "Andhra Pradesh", type: "State University" },
      { name: "Sri Venkateswara University", city: "Tirupati", state: "Andhra Pradesh", type: "State University" },
      { name: "GITAM University", city: "Visakhapatnam", state: "Andhra Pradesh", type: "Deemed University" },
      { name: "Koneru Lakshmaiah Education Foundation", city: "Guntur", state: "Andhra Pradesh", type: "Deemed University" },
      { name: "VIT-AP University", city: "Amaravati", state: "Andhra Pradesh", type: "Private" },
      { name: "SRM University, AP", city: "Amaravati", state: "Andhra Pradesh", type: "Private" },
      // Telangana Institutions
      { name: "Indian Institute of Technology Hyderabad", city: "Hyderabad", state: "Telangana", type: "Public" },
      { name: "University of Hyderabad", city: "Hyderabad", state: "Telangana", type: "Central University" },
      { name: "Osmania University", city: "Hyderabad", state: "Telangana", type: "State University" },
      { name: "NALSAR University of Law", city: "Hyderabad", state: "Telangana", type: "Public" },
      { name: "International Institute of Information Technology", city: "Hyderabad", state: "Telangana", type: "Deemed University" },
      { name: "The English and Foreign Languages University", city: "Hyderabad", state: "Telangana", type: "Central University" },
      { name: "ICFAI Foundation for Higher Education", city: "Hyderabad", state: "Telangana", type: "Deemed University" },
      { name: "Birla Institute of Technology and Science", city: "Hyderabad", state: "Telangana", type: "Private" }
    ];
    const institutionIds = [];
    institutions2.forEach(async (i) => {
      const institution = await this.createInstitution(i);
      institutionIds.push(institution.id);
    });
    setTimeout(() => {
      const apRankings = [
        {
          institutionId: 1,
          year: 2023,
          category: "Overall",
          rank: 24,
          tlrScore: 79.12,
          rpcScore: 70.45,
          goScore: 73.98,
          oiScore: 68.23,
          prScore: 72.56,
          totalScore: 74.32
        },
        {
          institutionId: 2,
          year: 2023,
          category: "Overall",
          rank: 31,
          tlrScore: 74.23,
          rpcScore: 68.78,
          goScore: 72.45,
          oiScore: 71.32,
          prScore: 63.87,
          totalScore: 70.88
        },
        {
          institutionId: 3,
          year: 2023,
          category: "Overall",
          rank: 43,
          tlrScore: 71.56,
          rpcScore: 62.34,
          goScore: 69.87,
          oiScore: 73.21,
          prScore: 61.23,
          totalScore: 67.65
        },
        {
          institutionId: 4,
          year: 2023,
          category: "Overall",
          rank: 57,
          tlrScore: 68.92,
          rpcScore: 58.76,
          goScore: 66.32,
          oiScore: 70.56,
          prScore: 59.87,
          totalScore: 64.89
        },
        {
          institutionId: 5,
          year: 2023,
          category: "Overall",
          rank: 64,
          tlrScore: 67.23,
          rpcScore: 56.45,
          goScore: 64.23,
          oiScore: 69.12,
          prScore: 58.32,
          totalScore: 63.21
        },
        {
          institutionId: 6,
          year: 2023,
          category: "Overall",
          rank: 72,
          tlrScore: 64.56,
          rpcScore: 52.23,
          goScore: 61.87,
          oiScore: 66.45,
          prScore: 55.78,
          totalScore: 60.43
        },
        {
          institutionId: 7,
          year: 2023,
          category: "Overall",
          rank: 78,
          tlrScore: 62.34,
          rpcScore: 49.87,
          goScore: 59.56,
          oiScore: 64.23,
          prScore: 53.67,
          totalScore: 58.12
        },
        // For Telangana
        {
          institutionId: 8,
          year: 2023,
          category: "Overall",
          rank: 9,
          tlrScore: 87.34,
          rpcScore: 84.56,
          goScore: 78.92,
          oiScore: 75.67,
          prScore: 81.23,
          totalScore: 82.56
        },
        {
          institutionId: 9,
          year: 2023,
          category: "Overall",
          rank: 11,
          tlrScore: 85.67,
          rpcScore: 82.34,
          goScore: 77.45,
          oiScore: 74.12,
          prScore: 79.87,
          totalScore: 80.76
        },
        {
          institutionId: 10,
          year: 2023,
          category: "Overall",
          rank: 15,
          tlrScore: 83.23,
          rpcScore: 78.92,
          goScore: 75.67,
          oiScore: 72.45,
          prScore: 77.34,
          totalScore: 78.12
        },
        {
          institutionId: 11,
          year: 2023,
          category: "Overall",
          rank: 17,
          tlrScore: 82.45,
          rpcScore: 76.23,
          goScore: 74.56,
          oiScore: 71.23,
          prScore: 76.67,
          totalScore: 77.23
        },
        {
          institutionId: 12,
          year: 2023,
          category: "Overall",
          rank: 22,
          tlrScore: 80.12,
          rpcScore: 75.67,
          goScore: 72.34,
          oiScore: 69.87,
          prScore: 74.56,
          totalScore: 75.67
        },
        {
          institutionId: 13,
          year: 2023,
          category: "Overall",
          rank: 34,
          tlrScore: 76.87,
          rpcScore: 70.23,
          goScore: 68.92,
          oiScore: 65.67,
          prScore: 71.23,
          totalScore: 72.12
        },
        {
          institutionId: 14,
          year: 2023,
          category: "Overall",
          rank: 45,
          tlrScore: 72.45,
          rpcScore: 67.89,
          goScore: 65.67,
          oiScore: 62.45,
          prScore: 68.92,
          totalScore: 68.34
        },
        {
          institutionId: 15,
          year: 2023,
          category: "Overall",
          rank: 53,
          tlrScore: 69.87,
          rpcScore: 63.45,
          goScore: 62.34,
          oiScore: 59.87,
          prScore: 65.67,
          totalScore: 65.23
        }
      ];
      const engineeringRankings = [
        // Andhra Pradesh
        {
          institutionId: 1,
          year: 2023,
          category: "Engineering",
          rank: 15,
          // TLR breakdown - Teaching, Learning & Resources
          ssScore: 18.5,
          fsrScore: 30,
          fqeScore: 17.29,
          fruScore: 30,
          // RPC breakdown - Research and Professional Practice
          puScore: 34.95,
          qpScore: 34.37,
          iprScore: 14,
          fpppScore: 9.78,
          // GO breakdown - Graduation Outcomes
          gphScore: 29.74,
          gueScore: 15,
          msScore: 19.34,
          gphdScore: 16.98,
          // OI breakdown - Outreach and Inclusivity
          rdScore: 21.57,
          wdScore: 14.88,
          escsScore: 9.49,
          pcsScore: 20,
          // Main scores
          tlrScore: 84.23,
          rpcScore: 75.67,
          goScore: 76.45,
          oiScore: 70.23,
          prScore: 79.87,
          totalScore: 78.34
        },
        {
          institutionId: 4,
          year: 2023,
          category: "Engineering",
          rank: 39,
          // TLR breakdown
          ssScore: 16.82,
          fsrScore: 27.65,
          fqeScore: 15.56,
          fruScore: 26.78,
          // RPC breakdown
          puScore: 30.12,
          qpScore: 29.87,
          iprScore: 10.25,
          fpppScore: 8.32,
          // GO breakdown
          gphScore: 25.34,
          gueScore: 14.23,
          msScore: 17.56,
          gphdScore: 14.21,
          // OI breakdown
          rdScore: 18.78,
          wdScore: 13.45,
          escsScore: 8.67,
          pcsScore: 17.54,
          // Main scores
          tlrScore: 72.45,
          rpcScore: 63.87,
          goScore: 68.92,
          oiScore: 64.67,
          prScore: 61.23,
          totalScore: 67.23
        },
        {
          institutionId: 5,
          year: 2023,
          category: "Engineering",
          rank: 47,
          // TLR breakdown
          ssScore: 15.43,
          fsrScore: 26.54,
          fqeScore: 14.87,
          fruScore: 25.32,
          // RPC breakdown
          puScore: 28.65,
          qpScore: 27.45,
          iprScore: 9.87,
          fpppScore: 7.65,
          // GO breakdown
          gphScore: 24.23,
          gueScore: 13.56,
          msScore: 16.78,
          gphdScore: 13.45,
          // OI breakdown
          rdScore: 17.65,
          wdScore: 12.98,
          escsScore: 8.12,
          pcsScore: 16.43,
          // Main scores
          tlrScore: 69.87,
          rpcScore: 60.23,
          goScore: 65.67,
          oiScore: 62.45,
          prScore: 58.92,
          totalScore: 64.56
        },
        // Telangana
        {
          institutionId: 8,
          year: 2023,
          category: "Engineering",
          rank: 8,
          // TLR breakdown
          ssScore: 19.87,
          fsrScore: 32.45,
          fqeScore: 18.76,
          fruScore: 31.98,
          // RPC breakdown
          puScore: 36.87,
          qpScore: 36.45,
          iprScore: 15.87,
          fpppScore: 10.56,
          // GO breakdown
          gphScore: 31.45,
          gueScore: 16.78,
          msScore: 20.87,
          gphdScore: 18.32,
          // OI breakdown
          rdScore: 23.45,
          wdScore: 16.32,
          escsScore: 10.23,
          pcsScore: 21.54,
          // Main scores
          tlrScore: 89.67,
          rpcScore: 86.23,
          goScore: 80.45,
          oiScore: 77.34,
          prScore: 84.56,
          totalScore: 84.87
        },
        {
          institutionId: 12,
          year: 2023,
          category: "Engineering",
          rank: 13,
          // TLR breakdown
          ssScore: 19.23,
          fsrScore: 31.78,
          fqeScore: 18.12,
          fruScore: 30.87,
          // RPC breakdown
          puScore: 35.98,
          qpScore: 35.54,
          iprScore: 14.98,
          fpppScore: 10.12,
          // GO breakdown
          gphScore: 30.87,
          gueScore: 15.98,
          msScore: 19.87,
          gphdScore: 17.65,
          // OI breakdown
          rdScore: 22.87,
          wdScore: 15.78,
          escsScore: 9.87,
          pcsScore: 20.87,
          // Main scores
          tlrScore: 85.45,
          rpcScore: 83.67,
          goScore: 78.92,
          oiScore: 75.67,
          prScore: 81.23,
          totalScore: 81.78
        },
        {
          institutionId: 15,
          year: 2023,
          category: "Engineering",
          rank: 32,
          // TLR breakdown
          ssScore: 17.54,
          fsrScore: 28.76,
          fqeScore: 16.32,
          fruScore: 27.98,
          // RPC breakdown
          puScore: 31.56,
          qpScore: 30.98,
          iprScore: 11.45,
          fpppScore: 8.87,
          // GO breakdown
          gphScore: 26.54,
          gueScore: 14.76,
          msScore: 18.12,
          gphdScore: 15.32,
          // OI breakdown
          rdScore: 19.54,
          wdScore: 14.12,
          escsScore: 9.12,
          pcsScore: 18.34,
          // Main scores
          tlrScore: 76.23,
          rpcScore: 72.45,
          goScore: 70.67,
          oiScore: 67.89,
          prScore: 73.56,
          totalScore: 73.12
        }
      ];
      const managementRankings = [
        // Andhra Pradesh
        {
          institutionId: 4,
          year: 2023,
          category: "Management",
          rank: 23,
          tlrScore: 78.92,
          rpcScore: 69.87,
          goScore: 74.56,
          oiScore: 72.34,
          prScore: 75.67,
          totalScore: 74.87
        },
        {
          institutionId: 5,
          year: 2023,
          category: "Management",
          rank: 31,
          tlrScore: 75.67,
          rpcScore: 65.43,
          goScore: 71.23,
          oiScore: 69.87,
          prScore: 72.45,
          totalScore: 71.56
        },
        // Telangana
        {
          institutionId: 10,
          year: 2023,
          category: "Management",
          rank: 19,
          tlrScore: 80.45,
          rpcScore: 72.34,
          goScore: 76.23,
          oiScore: 74.56,
          prScore: 77.89,
          totalScore: 76.92
        },
        {
          institutionId: 14,
          year: 2023,
          category: "Management",
          rank: 25,
          tlrScore: 77.34,
          rpcScore: 68.92,
          goScore: 73.45,
          oiScore: 71.23,
          prScore: 74.56,
          totalScore: 73.76
        }
      ];
      const allRankings = [...apRankings, ...engineeringRankings, ...managementRankings];
      const previousYearRankings = allRankings.map((ranking) => ({
        ...ranking,
        year: 2022,
        rank: ranking.rank + (Math.floor(Math.random() * 5) - 2),
        // Slight rank difference from 2023
        tlrScore: +(ranking.tlrScore - Math.random() * 2).toFixed(2),
        rpcScore: +(ranking.rpcScore - Math.random() * 2).toFixed(2),
        goScore: +(ranking.goScore - Math.random() * 2).toFixed(2),
        oiScore: +(ranking.oiScore - Math.random() * 2).toFixed(2),
        prScore: +(ranking.prScore - Math.random() * 2).toFixed(2),
        totalScore: +(ranking.totalScore - Math.random() * 2).toFixed(2)
      }));
      const combinedRankings = [...allRankings, ...previousYearRankings];
      combinedRankings.forEach(async (r) => {
        await this.createRanking(r);
      });
    }, 100);
  }
};
var storage = new MemStorage();

// server/routes.ts
import multer from "multer";
import { read, utils } from "xlsx";

// shared/schema.ts
import { pgTable, text, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  type: text("type").notNull()
  // Public, Private, Deemed University, etc.
});
var insertInstitutionSchema = createInsertSchema(institutions).pick({
  name: true,
  city: true,
  state: true,
  type: true
});
var rankings = pgTable("rankings", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull(),
  year: integer("year").notNull(),
  category: text("category").notNull(),
  // Overall, University, Engineering, etc.
  rank: integer("rank").notNull(),
  // TLR (Teaching, Learning & Resources) breakdown
  ssScore: real("ss_score"),
  // Student Strength
  fsrScore: real("fsr_score"),
  // Faculty-Student Ratio
  fqeScore: real("fqe_score"),
  // Faculty Qualification & Experience  
  fruScore: real("fru_score"),
  // Faculty Recruitment & Utilization
  // RPC (Research and Professional Practice) breakdown
  puScore: real("pu_score"),
  // Publications
  qpScore: real("qp_score"),
  // Quality of Publications
  iprScore: real("ipr_score"),
  // IPR and Patents
  fpppScore: real("fppp_score"),
  // Footprint of Projects & Professional Practice
  // GO (Graduation Outcomes) breakdown
  gphScore: real("gph_score"),
  // Graduation Performance in Higher Studies
  gueScore: real("gue_score"),
  // University Examinations
  msScore: real("ms_score"),
  // Median Salary
  gphdScore: real("gphd_score"),
  // Graduating Students in PhD
  // OI (Outreach and Inclusivity) breakdown
  rdScore: real("rd_score"),
  // Regional Diversity
  wdScore: real("wd_score"),
  // Women Diversity
  escsScore: real("escs_score"),
  // Economically & Socially Challenged Students
  pcsScore: real("pcs_score"),
  // Facilities for Physically Challenged Students
  // Scores for main categories
  tlrScore: real("tlr_score").notNull(),
  // Teaching, Learning & Resources
  rpcScore: real("rpc_score").notNull(),
  // Research and Professional Practice
  goScore: real("go_score").notNull(),
  // Graduation Outcomes
  oiScore: real("oi_score").notNull(),
  // Outreach and Inclusivity
  prScore: real("pr_score").notNull(),
  // Perception
  totalScore: real("total_score").notNull()
});
var insertRankingSchema = createInsertSchema(rankings).pick({
  institutionId: true,
  year: true,
  category: true,
  rank: true,
  // TLR breakdown
  ssScore: true,
  fsrScore: true,
  fqeScore: true,
  fruScore: true,
  // RPC breakdown
  puScore: true,
  qpScore: true,
  iprScore: true,
  fpppScore: true,
  // GO breakdown
  gphScore: true,
  gueScore: true,
  msScore: true,
  gphdScore: true,
  // OI breakdown
  rdScore: true,
  wdScore: true,
  escsScore: true,
  pcsScore: true,
  // Main scores
  tlrScore: true,
  rpcScore: true,
  goScore: true,
  oiScore: true,
  prScore: true,
  totalScore: true
});
var announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: text("created_at").notNull()
});
var insertAnnouncementSchema = createInsertSchema(announcements).pick({
  text: true,
  isActive: true,
  createdAt: true
});

// server/routes.ts
import { fromZodError } from "zod-validation-error";

// server/utils/ranking-calculations.ts
function calculateSSScore(data) {
  const basicStrength = data.totalStudents * 0.8;
  const phdStrength = data.phDStudents * 1.5;
  const normalizationFactor = 0.05;
  return Math.min(20, (basicStrength + phdStrength) * normalizationFactor);
}
function calculateFSRScore(data) {
  const fsr = data.totalStudents / Math.max(1, data.facultyCount);
  if (fsr <= 15) return 30;
  if (fsr > 50) return 0;
  return 30 * (1 - (fsr - 15) / 35);
}
function calculateFQEScore(data) {
  const phdPercentage = data.facultyWithPhD / Math.max(1, data.facultyCount) * 100;
  let phdScore = 0;
  if (phdPercentage >= 95) phdScore = 15;
  else if (phdPercentage >= 75) phdScore = 10 + (phdPercentage - 75) * 0.2;
  else if (phdPercentage >= 50) phdScore = 5 + (phdPercentage - 50) * 0.2;
  else phdScore = phdPercentage * 0.1;
  let expScore = 0;
  if (data.facultyExperience >= 15) expScore = 5;
  else if (data.facultyExperience >= 10) expScore = 3 + (data.facultyExperience - 10) * 0.4;
  else if (data.facultyExperience >= 5) expScore = 2 + (data.facultyExperience - 5) * 0.2;
  else expScore = data.facultyExperience * 0.4;
  return phdScore + expScore;
}
function calculateFRUScore(data) {
  const filledPositions = data.facultyCount / Math.max(1, data.sanctionedFacultyPositions) * 100;
  if (filledPositions >= 95) return 30;
  if (filledPositions < 40) return 0;
  return 30 * (filledPositions - 40) / 55;
}
function calculatePUScore(data) {
  const pubPerFaculty = data.researchPublications / Math.max(1, data.facultyCount);
  const maxPubPerFaculty = 7;
  return Math.min(35, pubPerFaculty / maxPubPerFaculty * 35);
}
function calculateQPScore(data) {
  const citationsPerPaper = data.citationsCount / Math.max(1, data.researchPublications);
  const maxCitationsPerPaper = 15;
  return Math.min(40, citationsPerPaper / maxCitationsPerPaper * 40);
}
function calculateIPRScore(data) {
  const patentsPerFaculty = (data.patentsFiled + 2 * data.patentsGranted) / Math.max(1, data.facultyCount);
  const maxPatentsPerFaculty = 1;
  return Math.min(15, patentsPerFaculty / maxPatentsPerFaculty * 15);
}
function calculateFPPPScore(data) {
  const earningsPerFaculty = (data.sponsoredResearchFunding + data.consultancyEarnings) / Math.max(1, data.facultyCount);
  const maxEarningsPerFaculty = 10;
  return Math.min(10, earningsPerFaculty / maxEarningsPerFaculty * 10);
}
function calculateGPHScore(data) {
  const graduationRate = data.graduatesInStipulatedTime / Math.max(1, data.totalGraduates) * 100;
  if (graduationRate >= 95) return 40;
  if (graduationRate < 50) return 0;
  return 40 * (graduationRate - 50) / 45;
}
function calculateGUEScore(data) {
  return 15 * (data.graduatesInStipulatedTime / Math.max(1, data.totalGraduates));
}
function calculateMSScore(data) {
  const salary = data.medianSalary;
  const referenceSalary = 8;
  if (salary >= 2 * referenceSalary) return 25;
  if (salary <= 0.5 * referenceSalary) return 0;
  return 25 * (salary - 0.5 * referenceSalary) / (1.5 * referenceSalary);
}
function calculateGPHDScore(data) {
  const phdGraduatePercentage = data.phDStudents / Math.max(1, data.totalGraduates) * 100;
  const referencePercentage = 20;
  return Math.min(20, phdGraduatePercentage / referencePercentage * 20);
}
function calculateRDScore(data) {
  const diversityPercentage = (data.studentsFromOtherStates + 2 * data.studentsFromAbroadCount) / Math.max(1, data.totalStudents) * 100;
  if (diversityPercentage >= 50) return 30;
  if (diversityPercentage < 5) return 0;
  return 30 * (diversityPercentage - 5) / 45;
}
function calculateWDScore(data) {
  const womenPercentage = data.femaleStudents / Math.max(1, data.totalStudents) * 100;
  if (womenPercentage >= 50) return 30;
  if (womenPercentage < 10) return 0;
  return 5 + 25 * (womenPercentage - 10) / 40;
}
function calculateESCSScore(data) {
  const escsPercentage = (data.scStStudents + data.economicallyBackwardStudents) / Math.max(1, data.totalStudents) * 100;
  if (escsPercentage >= 40) return 20;
  if (escsPercentage < 5) return 0;
  return 20 * (escsPercentage - 5) / 35;
}
function calculatePCSScore(data) {
  const pcsPercentage = data.physicallyHandicappedStudents / Math.max(1, data.totalStudents) * 100;
  if (pcsPercentage >= 3) return 20;
  if (pcsPercentage < 0.5) return 0;
  return 20 * (pcsPercentage - 0.5) / 2.5;
}
function calculatePRScore(data) {
  return data.peerPerceptionScore;
}
function calculateTLRScore(data) {
  const ss = calculateSSScore(data);
  const fsr = calculateFSRScore(data);
  const fqe = calculateFQEScore(data);
  const fru = calculateFRUScore(data);
  return ss + fsr + fqe + fru;
}
function calculateRPCScore(data) {
  const pu = calculatePUScore(data);
  const qp = calculateQPScore(data);
  const ipr = calculateIPRScore(data);
  const fppp = calculateFPPPScore(data);
  return pu + qp + ipr + fppp;
}
function calculateGOScore(data) {
  const gph = calculateGPHScore(data);
  const gue = calculateGUEScore(data);
  const ms = calculateMSScore(data);
  const gphd = calculateGPHDScore(data);
  return gph + gue + ms + gphd;
}
function calculateOIScore(data) {
  const rd = calculateRDScore(data);
  const wd = calculateWDScore(data);
  const escs = calculateESCSScore(data);
  const pcs = calculatePCSScore(data);
  return rd + wd + escs + pcs;
}
function calculateOverallScore(data) {
  const tlr = calculateTLRScore(data) * 3;
  const rpc = calculateRPCScore(data) * 3;
  const go = calculateGOScore(data) * 2;
  const oi = calculateOIScore(data);
  const pr = calculatePRScore(data);
  return tlr + rpc + go + oi + pr;
}
function calculateRankingScores(data) {
  return {
    ssScore: calculateSSScore(data),
    fsrScore: calculateFSRScore(data),
    fqeScore: calculateFQEScore(data),
    fruScore: calculateFRUScore(data),
    tlrScore: calculateTLRScore(data),
    puScore: calculatePUScore(data),
    qpScore: calculateQPScore(data),
    iprScore: calculateIPRScore(data),
    fpppScore: calculateFPPPScore(data),
    rpcScore: calculateRPCScore(data),
    gphScore: calculateGPHScore(data),
    gueScore: calculateGUEScore(data),
    msScore: calculateMSScore(data),
    gphdScore: calculateGPHDScore(data),
    goScore: calculateGOScore(data),
    rdScore: calculateRDScore(data),
    wdScore: calculateWDScore(data),
    escsScore: calculateESCSScore(data),
    pcsScore: calculatePCSScore(data),
    oiScore: calculateOIScore(data),
    prScore: calculatePRScore(data),
    totalScore: calculateOverallScore(data) / 10
    // Overall score normalized to 100
  };
}

// server/routes.ts
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB limit
});
async function registerRoutes(app2) {
  const apiRouter = app2.route("/api");
  app2.get("/api/announcements", async (req, res) => {
    try {
      const announcements2 = await storage.getAnnouncements();
      res.json(announcements2);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Error fetching announcements" });
    }
  });
  app2.get("/api/rankings", async (req, res) => {
    try {
      const { year, category, type, search } = req.query;
      const filters = {
        year: year ? parseInt(year) : void 0,
        category,
        institutionType: type,
        search
      };
      const rankings2 = await storage.getRankings(filters);
      res.json(rankings2);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      res.status(500).json({ message: "Error fetching rankings" });
    }
  });
  app2.get("/api/institutions", async (req, res) => {
    try {
      const institutions2 = await storage.getInstitutions();
      res.json(institutions2);
    } catch (error) {
      console.error("Error fetching institutions:", error);
      res.status(500).json({ message: "Error fetching institutions" });
    }
  });
  app2.post("/api/import", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const workbook = read(req.file.buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = utils.sheet_to_json(worksheet);
      if (!data || data.length === 0) {
        return res.status(400).json({ message: "No data found in the Excel file" });
      }
      const institutions2 = /* @__PURE__ */ new Map();
      for (const row of data) {
        const institutionName = row["Institution Name"] || row.Institution;
        const institutionCity = row.City || "";
        const institutionState = row.State;
        const institutionType = row["Institution Type"] || row.Type || "Unknown";
        if (!institutionName || !institutionState) {
          return res.status(400).json({
            message: "Missing required fields: Institution Name and State are required"
          });
        }
        const institutionData = {
          name: institutionName,
          city: institutionCity,
          state: institutionState,
          type: institutionType
        };
        try {
          const validatedInstitution = insertInstitutionSchema.parse(institutionData);
          const existingInstitutions = await storage.getInstitutions();
          const existingInstitution = existingInstitutions.find(
            (i) => i.name === validatedInstitution.name && i.state === validatedInstitution.state
          );
          if (existingInstitution) {
            institutions2.set(`${validatedInstitution.name}-${validatedInstitution.state}`, existingInstitution.id);
          } else {
            const newInstitution = await storage.createInstitution(validatedInstitution);
            institutions2.set(`${validatedInstitution.name}-${validatedInstitution.state}`, newInstitution.id);
          }
        } catch (error) {
          console.error("Error processing institution data:", error);
          return res.status(400).json({
            message: "Invalid institution data in Excel file",
            details: fromZodError(error).message
          });
        }
      }
      const rankings2 = [];
      for (const row of data) {
        const institutionName = row["Institution Name"] || row.Institution;
        const institutionState = row.State;
        const institutionId = institutions2.get(`${institutionName}-${institutionState}`);
        if (!institutionId) {
          return res.status(400).json({
            message: `Could not find or create institution: ${institutionName}, ${institutionState}`
          });
        }
        const year = parseInt(row.Year);
        const category = row.Category || "Engineering";
        const rank = parseInt(row.Rank) || 0;
        let rankingData;
        if (row["Faculty Count"] !== void 0 || row["Total Students"] !== void 0 || row["Research Publications"] !== void 0) {
          const rawData = {
            name: institutionName,
            state: institutionState,
            type: row["Institution Type"] || row.Type || "Unknown",
            establishedYear: parseInt(row["Established Year"]) || 2e3,
            // Faculty data
            facultyCount: parseInt(row["Faculty Count"]) || 0,
            facultyWithPhD: parseInt(row["Faculty with PhD"]) || 0,
            facultyExperience: parseFloat(row["Average Faculty Experience (years)"]) || 0,
            sanctionedFacultyPositions: parseInt(row["Sanctioned Faculty Positions"]) || 0,
            // Student data
            totalStudents: parseInt(row["Total Students"]) || 0,
            femaleStudents: parseInt(row["Female Students"]) || 0,
            scStStudents: parseInt(row["SC/ST Students"]) || 0,
            economicallyBackwardStudents: parseInt(row["Economically Backward Students"]) || 0,
            physicallyHandicappedStudents: parseInt(row["Physically Handicapped Students"]) || 0,
            phDStudents: parseInt(row["PhD Students"]) || 0,
            // Geographic diversity
            studentsFromOtherStates: parseInt(row["Students From Other States"]) || 0,
            studentsFromAbroadCount: parseInt(row["Students From Abroad"]) || 0,
            // Research & Publications
            researchPublications: parseInt(row["Research Publications"]) || 0,
            citationsCount: parseInt(row["Citations Count"]) || 0,
            patentsFiled: parseInt(row["Patents Filed"]) || 0,
            patentsGranted: parseInt(row["Patents Granted"]) || 0,
            sponsoredResearchFunding: parseFloat(row["Sponsored Research Funding (Lakhs)"]) || 0,
            consultancyEarnings: parseFloat(row["Consultancy Earnings (Lakhs)"]) || 0,
            // Placement & Higher Studies
            graduatesInHigherStudies: parseInt(row["Graduates in Higher Studies"]) || 0,
            graduatesPlaced: parseInt(row["Graduates Placed"]) || 0,
            medianSalary: parseFloat(row["Median Salary (Lakhs)"]) || 0,
            // Graduation metrics
            totalGraduates: parseInt(row["Total Graduates"]) || 0,
            graduatesInStipulatedTime: parseInt(row["Graduates in Stipulated Time"]) || 0,
            // Perceptual ranking
            peerPerceptionScore: parseFloat(row["Peer Perception Score"]) || 0
          };
          const scores = calculateRankingScores(rawData);
          rankingData = {
            institutionId,
            year,
            category,
            rank,
            ...scores
          };
          console.log(`Calculated scores for ${institutionName}:`, scores);
        } else {
          rankingData = {
            institutionId,
            year,
            category,
            rank,
            // TLR Parameters (Teaching, Learning & Resources)
            ssScore: row.SS ? parseFloat(row.SS) : null,
            fsrScore: row.FSR ? parseFloat(row.FSR) : null,
            fqeScore: row.FQE ? parseFloat(row.FQE) : null,
            fruScore: row.FRU ? parseFloat(row.FRU) : null,
            // RPC Parameters (Research and Professional Practice)
            puScore: row.PU ? parseFloat(row.PU) : null,
            qpScore: row.QP ? parseFloat(row.QP) : null,
            iprScore: row.IPR ? parseFloat(row.IPR) : null,
            fpppScore: row.FPPP ? parseFloat(row.FPPP) : null,
            // GO Parameters (Graduation Outcomes)
            gphScore: row.GPH ? parseFloat(row.GPH) : null,
            gueScore: row.GUE ? parseFloat(row.GUE) : null,
            msScore: row.MS ? parseFloat(row.MS) : null,
            gphdScore: row.GPHD ? parseFloat(row.GPHD) : null,
            // OI Parameters (Outreach and Inclusivity)
            rdScore: row.RD ? parseFloat(row.RD) : null,
            wdScore: row.WD ? parseFloat(row.WD) : null,
            escsScore: row.ESCS ? parseFloat(row.ESCS) : null,
            pcsScore: row.PCS ? parseFloat(row.PCS) : null,
            // Main category scores
            tlrScore: row.TLR ? parseFloat(row.TLR) : null,
            rpcScore: row.RPC ? parseFloat(row.RPC) : null,
            goScore: row.GO ? parseFloat(row.GO) : null,
            oiScore: row.OI ? parseFloat(row.OI) : null,
            prScore: row.PR ? parseFloat(row.PR) : null,
            totalScore: row.TotalScore ? parseFloat(row.TotalScore) : null
          };
          if (!rankingData.tlrScore && (rankingData.ssScore || rankingData.fsrScore || rankingData.fqeScore || rankingData.fruScore)) {
            const ss = rankingData.ssScore || 0;
            const fsr = rankingData.fsrScore || 0;
            const fqe = rankingData.fqeScore || 0;
            const fru = rankingData.fruScore || 0;
            rankingData.tlrScore = ss + fsr + fqe + fru;
          }
          if (!rankingData.rpcScore && (rankingData.puScore || rankingData.qpScore || rankingData.iprScore || rankingData.fpppScore)) {
            const pu = rankingData.puScore || 0;
            const qp = rankingData.qpScore || 0;
            const ipr = rankingData.iprScore || 0;
            const fppp = rankingData.fpppScore || 0;
            rankingData.rpcScore = pu + qp + ipr + fppp;
          }
          if (!rankingData.goScore && (rankingData.gphScore || rankingData.gueScore || rankingData.msScore || rankingData.gphdScore)) {
            const gph = rankingData.gphScore || 0;
            const gue = rankingData.gueScore || 0;
            const ms = rankingData.msScore || 0;
            const gphd = rankingData.gphdScore || 0;
            rankingData.goScore = gph + gue + ms + gphd;
          }
          if (!rankingData.oiScore && (rankingData.rdScore || rankingData.wdScore || rankingData.escsScore || rankingData.pcsScore)) {
            const rd = rankingData.rdScore || 0;
            const wd = rankingData.wdScore || 0;
            const escs = rankingData.escsScore || 0;
            const pcs = rankingData.pcsScore || 0;
            rankingData.oiScore = rd + wd + escs + pcs;
          }
          if (!rankingData.totalScore) {
            const tlr = rankingData.tlrScore || 0;
            const rpc = rankingData.rpcScore || 0;
            const go = rankingData.goScore || 0;
            const oi = rankingData.oiScore || 0;
            const pr = rankingData.prScore || 0;
            rankingData.totalScore = tlr * 0.3 + rpc * 0.3 + go * 0.2 + oi * 0.1 + pr * 0.1;
          }
        }
        try {
          const validatedRanking = insertRankingSchema.parse(rankingData);
          rankings2.push(validatedRanking);
        } catch (error) {
          console.error("Error processing ranking data:", error);
          return res.status(400).json({
            message: "Invalid ranking data in Excel file",
            details: fromZodError(error).message
          });
        }
      }
      await storage.bulkCreateRankings(rankings2);
      res.status(200).json({
        message: "Import successful",
        institutionsCount: institutions2.size,
        rankingsCount: rankings2.length
      });
    } catch (error) {
      console.error("Error importing Excel file:", error);
      res.status(500).json({ message: "Error importing Excel file" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0"
    //reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
