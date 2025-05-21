"use client";

import { useState, useEffect } from "react";
import api from "@/api";
import DashboardLayout from "@/components/dashboard-layout";

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30days");
  const [platform, setPlatform] = useState("all");

  // Dummy analytics data
  const dummyAnalyticsData = {
    summary: {
      totalEngagement: 12547,
      engagementGrowth: 8.3,
      impressions: 98450,
      impressionsGrowth: 12.7,
      clicks: 3245,
      clicksGrowth: 5.2,
      shares: 876,
      sharesGrowth: 15.8,
    },
    platforms: {
      facebook: {
        name: "Facebook",
        color: "#4267B2",
        engagement: 4235,
        engagementGrowth: 6.2,
        impressions: 35670,
        impressionsGrowth: 9.5,
        clicks: 1245,
        clicksGrowth: 3.8,
        shares: 325,
        sharesGrowth: 12.4,
      },
      instagram: {
        name: "Instagram",
        color: "#8a3ab9",
        engagement: 6890,
        engagementGrowth: 10.5,
        impressions: 42780,
        impressionsGrowth: 15.2,
        clicks: 1560,
        clicksGrowth: 7.3,
        shares: 421,
        sharesGrowth: 18.9,
      },
      twitter: {
        name: "Twitter",
        color: "#1DA1F2",
        engagement: 1422,
        engagementGrowth: 4.8,
        impressions: 20000,
        impressionsGrowth: 8.1,
        clicks: 440,
        clicksGrowth: 2.5,
        shares: 130,
        sharesGrowth: 9.7,
      },
    },
    topPosts: [
      {
        id: 1,
        platform: "Instagram",
        content: "Check out our new product line! #newproduct #launch",
        date: "2023-05-10T14:30:00Z",
        engagement: 1245,
        impressions: 8760,
        clicks: 320,
        shares: 87,
      },
      {
        id: 2,
        platform: "Facebook",
        content:
          "We're excited to announce our summer sale! 30% off all products.",
        date: "2023-05-05T10:15:00Z",
        engagement: 980,
        impressions: 7540,
        clicks: 290,
        shares: 65,
      },
      {
        id: 3,
        platform: "Twitter",
        content:
          "Join our webinar on social media strategies for small businesses. Register now!",
        date: "2023-05-12T16:45:00Z",
        engagement: 750,
        impressions: 5230,
        clicks: 210,
        shares: 42,
      },
    ],
    engagementByDay: [
      { date: "2023-04-15", facebook: 120, instagram: 180, twitter: 45 },
      { date: "2023-04-16", facebook: 135, instagram: 195, twitter: 50 },
      { date: "2023-04-17", facebook: 115, instagram: 210, twitter: 48 },
      { date: "2023-04-18", facebook: 140, instagram: 225, twitter: 52 },
      { date: "2023-04-19", facebook: 155, instagram: 240, twitter: 55 },
      { date: "2023-04-20", facebook: 170, instagram: 255, twitter: 60 },
      { date: "2023-04-21", facebook: 160, instagram: 270, twitter: 58 },
      { date: "2023-04-22", facebook: 175, instagram: 285, twitter: 62 },
      { date: "2023-04-23", facebook: 190, instagram: 300, twitter: 65 },
      { date: "2023-04-24", facebook: 180, instagram: 315, twitter: 70 },
      { date: "2023-04-25", facebook: 195, instagram: 330, twitter: 68 },
      { date: "2023-04-26", facebook: 210, instagram: 345, twitter: 72 },
      { date: "2023-04-27", facebook: 200, instagram: 360, twitter: 75 },
      { date: "2023-04-28", facebook: 215, instagram: 375, twitter: 78 },
      { date: "2023-04-29", facebook: 230, instagram: 390, twitter: 80 },
      { date: "2023-04-30", facebook: 220, instagram: 405, twitter: 82 },
      { date: "2023-05-01", facebook: 235, instagram: 420, twitter: 85 },
      { date: "2023-05-02", facebook: 250, instagram: 435, twitter: 88 },
      { date: "2023-05-03", facebook: 240, instagram: 450, twitter: 90 },
      { date: "2023-05-04", facebook: 255, instagram: 465, twitter: 92 },
      { date: "2023-05-05", facebook: 270, instagram: 480, twitter: 95 },
      { date: "2023-05-06", facebook: 260, instagram: 495, twitter: 98 },
      { date: "2023-05-07", facebook: 275, instagram: 510, twitter: 100 },
      { date: "2023-05-08", facebook: 290, instagram: 525, twitter: 102 },
      { date: "2023-05-09", facebook: 280, instagram: 540, twitter: 105 },
      { date: "2023-05-10", facebook: 295, instagram: 555, twitter: 108 },
      { date: "2023-05-11", facebook: 310, instagram: 570, twitter: 110 },
      { date: "2023-05-12", facebook: 300, instagram: 585, twitter: 112 },
      { date: "2023-05-13", facebook: 315, instagram: 600, twitter: 115 },
      { date: "2023-05-14", facebook: 330, instagram: 615, twitter: 118 },
    ],
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Try to fetch from API first
        let data = null;
        try {
          const token = localStorage.getItem("access_token");
          const response = await api.get(
            `/api/analytics?timeRange=${timeRange}&platform=${platform}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          data = response.data;
        } catch (error) {
          console.log("API not available, using dummy data");
        }

        // If API call failed, use dummy data
        if (!data) {
          data = dummyAnalyticsData;
        }

        setAnalyticsData(data);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange, platform]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num != null ? num.toString() : "0";
  };

  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Analytics</h2>
        <div className="d-flex gap-3">
          <select
            className="form-select form-select-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
          <select
            className="form-select form-select-sm"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">
                Total Engagement
              </h6>
              <h2 className="card-title h1 mb-2">
                {formatNumber(analyticsData.summary.totalEngagement)}
              </h2>
              <p className="card-text text-success mb-0 d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-1"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                {analyticsData.summary.engagementGrowth}% from last period
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Impressions</h6>
              <h2 className="card-title h1 mb-2">
                {formatNumber(analyticsData.summary.impressions)}
              </h2>
              <p className="card-text text-success mb-0 d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-1"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                {analyticsData.summary.impressionsGrowth}% from last period
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Clicks</h6>
              <h2 className="card-title h1 mb-2">
                {formatNumber(analyticsData.summary.clicks)}
              </h2>
              <p className="card-text text-success mb-0 d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-1"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                {analyticsData.summary.clicksGrowth}% from last period
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-1 text-muted">Shares</h6>
              <h2 className="card-title h1 mb-2">
                {formatNumber(analyticsData.summary.shares)}
              </h2>
              <p className="card-text text-success mb-0 d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-1"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                {analyticsData.summary.sharesGrowth}% from last period
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <h3 className="h5 mb-4">Platform Performance</h3>
      <div className="row g-4 mb-5">
        {Object.values(analyticsData.platforms).map((platform) => (
          <div className="col-md-4" key={platform.name}>
            <div className="card h-100">
              <div
                className="card-header"
                style={{ backgroundColor: platform.color, color: "white" }}
              >
                <h5 className="mb-0">{platform.name}</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="d-flex flex-column">
                      <span className="text-muted small">Engagement</span>
                      <span className="fw-bold">
                        {formatNumber(platform.engagement)}
                      </span>
                      <span className="small text-success">
                        +{platform.engagementGrowth}%
                      </span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex flex-column">
                      <span className="text-muted small">Impressions</span>
                      <span className="fw-bold">
                        {formatNumber(platform.impressions)}
                      </span>
                      <span className="small text-success">
                        +{platform.impressionsGrowth}%
                      </span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex flex-column">
                      <span className="text-muted small">Clicks</span>
                      <span className="fw-bold">
                        {formatNumber(platform.clicks)}
                      </span>
                      <span className="small text-success">
                        +{platform.clicksGrowth}%
                      </span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex flex-column">
                      <span className="text-muted small">Shares</span>
                      <span className="fw-bold">
                        {formatNumber(platform.shares)}
                      </span>
                      <span className="small text-success">
                        +{platform.sharesGrowth}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Chart */}
      <h3 className="h5 mb-4">Engagement Over Time</h3>
      <div className="card mb-5">
        <div className="card-body">
          <div style={{ height: "300px" }} className="d-flex align-items-end">
            {analyticsData?.engagementByDay?.slice(-14).map((day, index) => (
              <div
                key={index}
                className="d-flex flex-column align-items-center"
                style={{ flex: 1 }}
              >
                <div
                  className="d-flex flex-column-reverse"
                  style={{ height: "250px" }}
                >
                  <div
                    className="bg-primary"
                    style={{
                      width: "10px",
                      height: `${(day.facebook / 330) * 100}%`,
                      marginBottom: "2px",
                    }}
                    title={`Facebook: ${day.facebook}`}
                  ></div>
                  <div
                    className="bg-purple"
                    style={{
                      width: "10px",
                      height: `${(day.instagram / 330) * 100}%`,
                      marginBottom: "2px",
                      backgroundColor: "#8a3ab9",
                    }}
                    title={`Instagram: ${day.instagram}`}
                  ></div>
                  <div
                    className="bg-info"
                    style={{
                      width: "10px",
                      height: `${(day.twitter / 330) * 100}%`,
                      marginBottom: "2px",
                    }}
                    title={`Twitter: ${day.twitter}`}
                  ></div>
                </div>
                <small
                  className="text-muted mt-2"
                  style={{ fontSize: "0.7rem" }}
                >
                  {formatDate(day.date)}
                </small>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-center mt-3">
            <div className="d-flex align-items-center me-3">
              <div
                className="bg-primary me-2"
                style={{ width: "10px", height: "10px" }}
              ></div>
              <small>Facebook</small>
            </div>
            <div className="d-flex align-items-center me-3">
              <div
                className="me-2"
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#8a3ab9",
                }}
              ></div>
              <small>Instagram</small>
            </div>
            <div className="d-flex align-items-center">
              <div
                className="bg-info me-2"
                style={{ width: "10px", height: "10px" }}
              ></div>
              <small>Twitter</small>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <h3 className="h5 mb-4">Top Performing Posts</h3>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Content</th>
              <th>Date</th>
              <th>Engagement</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>Shares</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.topPosts.map((post) => (
              <tr key={post.id}>
                <td>
                  <span
                    className="badge"
                    style={{
                      backgroundColor:
                        post.platform === "Instagram"
                          ? "#8a3ab9"
                          : post.platform === "Facebook"
                          ? "#4267B2"
                          : "#1DA1F2",
                    }}
                  >
                    {post.platform}
                  </span>
                </td>
                <td>
                  <div
                    style={{
                      maxWidth: "300px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {post.content}
                  </div>
                </td>
                <td>{new Date(post.date).toLocaleDateString()}</td>
                <td>{formatNumber(post.engagement)}</td>
                <td>{formatNumber(post.impressions)}</td>
                <td>{formatNumber(post.clicks)}</td>
                <td>{formatNumber(post.shares)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
