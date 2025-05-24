"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/components/dashboard-layout";
import api from "@/api";

export default function HashtagSuggestionsPage() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [industry, setIndustry] = useState("general");
  const [count, setCount] = useState(15);
  const [suggestions, setSuggestions] = useState([]);
  const [savedHashtags, setSavedHashtags] = useState([]);

  // Dummy data for saved hashtag groups
  const dummySavedHashtags = [
    {
      id: 1,
      name: "Marketing",
      hashtags: ["#marketing", "#digitalmarketing", "#socialmediamarketing"],
    },
    {
      id: 2,
      name: "Small Business",
      hashtags: [
        "#smallbusiness",
        "#entrepreneur",
        "#smallbusinessowner",
        "#supportsmallbusiness",
      ],
    },
    {
      id: 3,
      name: "Product Launch",
      hashtags: ["#newproduct", "#launch", "#newlaunch", "#comingsoon"],
    },
  ];

  // Dummy data for suggested hashtags
  const dummySuggestions = ["#socialmedia", "#digitalmarketing", "#marketing"];

  useEffect(() => {
    // Fetch saved hashtag groups
    const fetchSavedHashtags = async () => {
      setLoading(true);
      try {
        // Try to fetch from API first
        let hashtagsData = null;
        try {
          const token = localStorage.getItem("access_token");
          const response = await axios.get("/api/hashtags/saved", {
            headers: { Authorization: `Bearer ${token}` },
          });
          hashtagsData = response.data;
        } catch (error) {
          console.log("API not available, using dummy data");
        }

        // If API call failed, use dummy data
        if (!hashtagsData) {
          hashtagsData = dummySavedHashtags;
        }

        setSavedHashtags(hashtagsData);
      } catch (err) {
        console.error("Error fetching saved hashtags:", err);
        setError("Failed to load saved hashtags. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedHashtags();
  }, []);

  const generateHashtags = async () => {
    setGenerating(true);
    setError(null);
    try {
      // Try to fetch from API first
      let suggestionsData = null;
      try {
        const token = localStorage.getItem("access_token");
        const response = await api.post(
          "/api/hashtags/generate",
          {
            content,
            platform,
            industry,
            count,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        suggestionsData = response.data.hashtags;
        console.log("API call result:", response.data);
      } catch (error) {
        console.log("API not available, using dummy data");
      }
      // If API call failed, use dummy data
      if (!suggestionsData) {
        suggestionsData = dummySuggestions;
      }

      setSuggestions(suggestionsData);
      console.log("Generated hashtags:", suggestionsData);
    } catch (err) {
      console.error("Error generating hashtags:", err);
      setError("Failed to generate hashtags. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const saveHashtagGroup = async () => {
    if (suggestions.length === 0) return;

    const groupName = prompt("Enter a name for this hashtag group:");
    if (!groupName) return;

    try {
      // Try API call first
      try {
        const token = localStorage.getItem("access_token");
        await api.post(
          "/api/hashtags/save",
          {
            name: groupName,
            hashtags: suggestions,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.log("API not available, updating local state only");
      }

      // Update local state
      const newGroup = {
        id: Date.now(), // Generate a temporary ID
        name: groupName,
        hashtags: suggestions,
      };
      setSavedHashtags([...savedHashtags, newGroup]);
    } catch (err) {
      console.error("Error saving hashtag group:", err);
      alert("Failed to save hashtag group. Please try again.");
    }
  };

  const deleteHashtagGroup = async (id) => {
    if (!confirm("Are you sure you want to delete this hashtag group?")) return;

    try {
      // Try API call first
      try {
        const token = localStorage.getItem("access_token");
        await api.delete(`/api/hashtags/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.log("API not available, updating local state only");
      }

      // Update local state
      setSavedHashtags(savedHashtags.filter((group) => group.id !== id));
    } catch (err) {
      console.error("Error deleting hashtag group:", err);
      alert("Failed to delete hashtag group. Please try again.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Hashtag Suggestions</h2>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Hashtag Generator */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Generate Hashtags</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="content" className="form-label">
                  Post Content
                </label>
                <textarea
                  className="form-control"
                  id="content"
                  rows="4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your post content to generate relevant hashtags..."
                ></textarea>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label htmlFor="platform" className="form-label">
                    Platform
                  </label>
                  <select
                    className="form-select"
                    id="platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    <option value="instagram">Instagram</option>
                    {/* <option value="twitter">Twitter</option> */}
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="industry" className="form-label">
                    Industry
                  </label>
                  <select
                    className="form-select"
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option value="general">General</option>
                    <option value="artificial intelligence">AI</option>
                    <option value="garment">Garment</option>
                    <option value="technology">Technology</option>
                    <option value="fashion">Fashion</option>
                    <option value="food">Food & Beverage</option>
                    <option value="travel">Travel</option>
                    <option value="fitness">Fitness</option>
                    <option value="beauty">Beauty</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="count" className="form-label">
                    Number of Hashtags
                  </label>
                  <select
                    className="form-select"
                    id="count"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                  </select>
                </div>
              </div>

              <div className="d-grid">
                <button
                  className="btn btn-primary"
                  onClick={generateHashtags}
                  disabled={!content.trim() || generating}
                >
                  {generating ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Generating...
                    </>
                  ) : (
                    "Generate Hashtags"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Generated Hashtags */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Suggested Hashtags</h5>
                <div>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => copyToClipboard(suggestions.join(" "))}
                  >
                    Copy All
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={saveHashtagGroup}
                  >
                    Save Group
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {suggestions.map((hashtag, index) => (
                    <div key={index} className="badge bg-light text-dark p-2">
                      {hashtag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          {/* Saved Hashtag Groups */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Saved Hashtag Groups</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="d-flex justify-content-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : savedHashtags.length === 0 ? (
                <div className="alert alert-info">
                  No saved hashtag groups. Generate and save hashtags to create
                  your first group.
                </div>
              ) : (
                <div className="accordion" id="hashtagGroups">
                  {savedHashtags.map((group) => (
                    <div className="accordion-item" key={group.id}>
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#group-${group.id}`}
                        >
                          {group.name} ({group.hashtags.length})
                        </button>
                      </h2>
                      <div
                        id={`group-${group.id}`}
                        className="accordion-collapse collapse"
                      >
                        <div className="accordion-body">
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {group.hashtags.map((hashtag, index) => (
                              <div
                                key={index}
                                className="badge bg-light text-dark p-2"
                              >
                                {hashtag}
                              </div>
                            ))}
                          </div>
                          <div className="d-flex justify-content-between">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                copyToClipboard(group.hashtags.join(" "))
                              }
                            >
                              Copy All
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteHashtagGroup(group.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
