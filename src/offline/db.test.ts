import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { db } from "./db";

// Each test gets a fresh DB by re-opening after delete
beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe("BcScannerDB schema", () => {
  it("opens without error", async () => {
    expect(db.isOpen()).toBe(true);
  });

  it("has all required stores", () => {
    const tables = db.tables.map((t) => t.name);
    expect(tables).toContain("session");
    expect(tables).toContain("cryptoKey");
    expect(tables).toContain("campaigns");
    expect(tables).toContain("pendingLeads");
    expect(tables).toContain("recentLeads");
    expect(tables).toContain("activeCampaign");
  });

  it("session store uses singleton id 'current'", async () => {
    await db.session.put({ id: "current", encrypted: "abc", iv: "xyz" });
    const row = await db.session.get("current");
    expect(row?.encrypted).toBe("abc");
  });

  it("cryptoKey store uses singleton id 'master'", async () => {
    const raw = new Uint8Array([1, 2, 3, 4]).buffer;
    await db.cryptoKey.put({ id: "master", keyData: raw });
    const row = await db.cryptoKey.get("master");
    expect(new Uint8Array(row!.keyData)).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it("campaigns store is queryable by campaign_name", async () => {
    await db.campaigns.bulkPut([
      { name: "CAMP-001", campaign_name: "Cairo Expo", modified: "2026-04-01" },
      { name: "CAMP-002", campaign_name: "Riyadh Summit", modified: "2026-04-10" },
    ]);
    const results = await db.campaigns.where("campaign_name").equals("Cairo Expo").toArray();
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("CAMP-001");
  });

  it("pendingLeads store uses auto-increment id", async () => {
    const id1 = await db.pendingLeads.add({
      campaign_name: "CAMP-001",
      payload: {
        lead_name: "Ahmed Hassan",
        source: "Campaign",
        campaign_name: "CAMP-001",
      },
      status: "pending",
      attempts: 0,
      created_at: new Date().toISOString(),
    });
    const id2 = await db.pendingLeads.add({
      campaign_name: "CAMP-001",
      payload: {
        lead_name: "Sara Ali",
        source: "Campaign",
        campaign_name: "CAMP-001",
      },
      status: "pending",
      attempts: 0,
      created_at: new Date().toISOString(),
    });
    expect(id2).toBeGreaterThan(id1);
  });

  it("pendingLeads can be queried by status", async () => {
    await db.pendingLeads.bulkAdd([
      {
        campaign_name: "CAMP-001",
        payload: { lead_name: "A", source: "Campaign", campaign_name: "CAMP-001" },
        status: "pending",
        attempts: 0,
        created_at: new Date().toISOString(),
      },
      {
        campaign_name: "CAMP-001",
        payload: { lead_name: "B", source: "Campaign", campaign_name: "CAMP-001" },
        status: "failed",
        attempts: 5,
        created_at: new Date().toISOString(),
      },
    ]);
    const pending = await db.pendingLeads.where("status").equals("pending").toArray();
    const failed = await db.pendingLeads.where("status").equals("failed").toArray();
    expect(pending).toHaveLength(1);
    expect(failed).toHaveLength(1);
  });

  it("activeCampaign is a singleton", async () => {
    await db.activeCampaign.put({ id: "active", campaign_name: "CAMP-001" });
    await db.activeCampaign.put({ id: "active", campaign_name: "CAMP-002" });
    const count = await db.activeCampaign.count();
    expect(count).toBe(1);
    const row = await db.activeCampaign.get("active");
    expect(row?.campaign_name).toBe("CAMP-002");
  });
});
