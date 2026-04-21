import { describe, it, expect, beforeEach, afterEach } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { listCampaigns, createCampaign } from "./campaignApi";
import { ENDPOINTS } from "@/shared/api/endpoints";

const BASE = "https://erp.example.com";

function buildMock() {
  const instance = axios.create({ baseURL: BASE });
  const mock = new MockAdapter(instance);
  return { instance, mock };
}

const SAMPLE_CAMPAIGNS = [
  { name: "CAMP-001", campaign_name: "Cairo Expo 2026", start_date: "2026-04-01", modified: "2026-04-01" },
  { name: "CAMP-002", campaign_name: "Riyadh Summit", start_date: "2026-05-10", modified: "2026-04-10" },
];

// ─── listCampaigns ────────────────────────────────────────────────────────────

describe("listCampaigns", () => {
  let mock: MockAdapter;
  let instance: ReturnType<typeof axios.create>;

  beforeEach(() => {
    ({ instance, mock } = buildMock());
  });
  afterEach(() => mock.restore());

  it("returns an array of campaigns on 200", async () => {
    mock.onGet(ENDPOINTS.campaigns).reply(200, { data: SAMPLE_CAMPAIGNS });
    const result = await listCampaigns(instance);
    expect(result).toHaveLength(2);
    expect(result[0].campaign_name).toBe("Cairo Expo 2026");
  });

  it("returns an empty array when no campaigns exist", async () => {
    mock.onGet(ENDPOINTS.campaigns).reply(200, { data: [] });
    const result = await listCampaigns(instance);
    expect(result).toEqual([]);
  });

  it("throws on 401", async () => {
    mock.onGet(ENDPOINTS.campaigns).reply(401);
    await expect(listCampaigns(instance)).rejects.toThrow();
  });

  it("throws on network error", async () => {
    mock.onGet(ENDPOINTS.campaigns).networkError();
    await expect(listCampaigns(instance)).rejects.toThrow();
  });

  it("throws on 500", async () => {
    mock.onGet(ENDPOINTS.campaigns).reply(500);
    await expect(listCampaigns(instance)).rejects.toThrow();
  });
});

// ─── createCampaign ───────────────────────────────────────────────────────────

describe("createCampaign", () => {
  let mock: MockAdapter;
  let instance: ReturnType<typeof axios.create>;

  beforeEach(() => {
    ({ instance, mock } = buildMock());
  });
  afterEach(() => mock.restore());

  it("returns the created campaign on 200", async () => {
    const created = { name: "CAMP-003", campaign_name: "New Event", start_date: "2026-06-01", modified: "2026-06-01" };
    mock.onPost(ENDPOINTS.campaigns).reply(200, { data: created });
    const result = await createCampaign(instance, {
      campaign_name: "New Event",
      start_date: "2026-06-01",
    });
    expect(result.name).toBe("CAMP-003");
    expect(result.campaign_name).toBe("New Event");
  });

  it("throws on 401", async () => {
    mock.onPost(ENDPOINTS.campaigns).reply(401);
    await expect(
      createCampaign(instance, { campaign_name: "X" })
    ).rejects.toThrow();
  });

  it("throws on 403 (no permission)", async () => {
    mock.onPost(ENDPOINTS.campaigns).reply(403);
    await expect(
      createCampaign(instance, { campaign_name: "X" })
    ).rejects.toThrow();
  });

  it("throws on network error", async () => {
    mock.onPost(ENDPOINTS.campaigns).networkError();
    await expect(
      createCampaign(instance, { campaign_name: "X" })
    ).rejects.toThrow();
  });
});
