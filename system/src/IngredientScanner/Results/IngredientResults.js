import React, { useEffect, useState } from "react";
// --- ⭐ CHANGED ---
// Re-enabled the real hooks from react-router-dom
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, FileText } from "lucide-react";
// --- ⭐ CHANGED ---
// Re-enabled your real Supabase client and CSS file
import { supabase } from "../../supabaseClient";
import "./IngredientResults.css";

// --- MOCK SUPABASE CLIENT ---
// --- ⭐ REMOVED ---
// The entire mock Supabase object has been deleted.
// --- END MOCK ---


// --- OCR Cleaning Function (UPDATED) ---
// Cleans and formats the raw OCR text into structured, readable ingredients
const cleanOCRText = (text) => {
  return text
  .replace(/ingredients?:?/gi, "") // remove "Ingredients:" or similar labels
  .replace(/^[\w\s/\u00C0-\u017F]*:\s*/i, "") // remove any complex label at the start
    .replace(/~\s*\/\s*:\s*/g,"")
    .replace(/\(.*?\)/g, "") // remove text inside parentheses (e.g., (GENTIAN))
    .replace(/\[.*?\]/g, "") // remove text inside square brackets like [ILN50436]
    .replace(/———m/g, "") // OCR artifact cleanup
    .replace(/-\n/g, "") // joins split words across newlines
    .replace(/\n/g, " ") // replaces line breaks with spaces
    .replace(/\\AQUA\\EAU/gi, "") // specific fix for WATER\AQUA\EAU
    .replace(/\s+and\s+/gi, ",")
    .replace(/Murraya Koenig/gi,"Murraya Koenigii")
    .replace (/J\s+PARFUM\/FRAGRANCE/gi,"PARFUM/FRAGRANCE")
    .replace(/PANTHEJ\s+PANTHENYL/gi,"PANTHENOL,PANTHENYL")
    .replace (/METHYLCHLOROISOTHIAZOLINNE/gi,"METHYLCHLOROISOTHIAZOLINONE")
    .replace (/\.?\s*[0O]\.?\s*$/gi,"")
    .replace(/\s*[·•.+]+\s*/g, ", ") 
    .replace(/,{2,}/g, ", ") // remove duplicate commas
    .replace(/\s*,\s*/g, ", ") // normalize comma spacing
    .replace(/\s+/g, " ") 
    .trim();
};

// --- Parsing Logic (UPDATED) ---
// Converts cleaned text into an array of individual ingredients
const parseText = (text) => {
  return text
    .split(",")
    .map((item) => item.trim().replace(/^\s*:\s*/,""))
    .filter((item) => item.length > 0)
    .map((item) => item.replace(/([0-9])([A-Z])/g, "$1 $2"));
};

// --- MOCK ROUTER HOOKS ---
// --- ⭐ REMOVED ---
// The mock useNavigate and useLocation functions have been deleted.
// --- END MOCK ---

const IngredientResults = () => {
  // --- ⭐ CHANGED ---
  // These are now the REAL hooks from react-router-dom.
  // They will receive the state you pass from your upload page.
  const location = useLocation();
  const navigate = useNavigate();
  
  // This will now get the REAL image URL and rawText from the previous page
  const { image, rawText } = location.state || {};

  const [matchedIngredients, setMatchedIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Effect Hook to Process OCR Text ---
  useEffect(() => {
    if (!rawText) return;

    const processIngredients = async () => {
      setLoading(true);

      // Step 1: Clean and parse text
      const cleaned = cleanOCRText(rawText);
      const parsedList = parseText(cleaned);

      if (parsedList.length === 0) {
        setMatchedIngredients([]);
        setLoading(false);
        return;
      }

      // Step 2: Construct Supabase query for matching ingredients
      const filters = parsedList.map((item) => `name.ilike.%${item}%`).join(",");

      // --- ⭐ CHANGED ---
      // This now uses your REAL Supabase client
      const { data: dbMatches, error } = await supabase
        .from("ingredients")
        .select("name, function, safety_level, category, warnings")
        .or(filters);

      if (error) {
        console.error("Supabase query error:", error);
      }

      // Step 3: Match parsed ingredients with database results
      const matches = parsedList.map((item) => {
        const lowerItem = item.toLowerCase();
        const match =
          dbMatches?.find((dbItem) =>
            dbItem.name.toLowerCase().includes(lowerItem)
          ) || null;

        return { ingredient: item, details: match };
      });

      setMatchedIngredients(matches);
      setLoading(false);
    };

    processIngredients();
  }, [rawText]);

  // --- Fallback UI if no OCR data is available ---
  if (!rawText) {
    return (
      <div className="results-container error-state">
        <div className="error-card">
          <h1 className="error-title">No Data Available</h1>
          <p className="error-message">
            It looks like the text extraction failed or this page was accessed directly.
            Please return to the scanner and upload a product label again.
          </p>
          <button className="back-btn primary-btn" onClick={() => navigate(-1)}>
            <ArrowLeft className="icon-left" /> Back to Scanner
          </button>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <>
      {/* --- ⭐ REMOVED --- */}
      {/* The large <style> block was deleted because 
          you are now importing your real "./IngredientResults.css" file */}
      
      <div className="results-container">
        <button onClick={() => navigate(-1)} className="back-link">
          <ArrowLeft className="icon-left" /> Back to Scan
        </button>

        <div className="content-card">
          <h1 className="main-title">Ingredient Scan Results</h1>
          <div className="grid-layout">
            {/* ---------- LEFT COLUMN: IMAGE + RAW TEXT ---------- */}
            <div className="column preview-column">
              <h2 className="column-title">
                <FileText className="icon-left" /> Original Scan Preview
              </h2>
              <div className="image-display-area">
                {image ? (
                  <img
                    src={image} // <-- This is now the REAL image URL
                    alt="Uploaded Ingredient Label"
                    className="image-preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/400x300/e0e7ff/4338ca?text=Image+Unavailable";
                    }}
                  />
                ) : (
                  <p className="placeholder-text">No image available.</p>
                )}
              </div>

              <div className="raw-text-section">
                <h3 className="raw-text-header">Extracted Text</h3>
                {/* This is now the REAL rawText */}
                <pre className="raw-text-content">{rawText}</pre>
              </div>
            </div>

            {/* ---------- RIGHT COLUMN: PARSED INGREDIENTS ---------- */}
            <div className="column ingredients-column">
              <h2 className="column-title">
                <Package className="icon-left" /> Parsed & Matched Ingredients
              </h2>

              <div className="parsed-list-card">
                {loading ? (
                  <p className="summary-text">Analyzing ingredients...</p>
                ) : matchedIngredients.length > 0 ? (
                  <>
                    <p className="summary-text">
                      Successfully identified{" "}
                      <span>{matchedIngredients.length}</span> ingredients from
                      the product label.
                    </p>

                    <ul className="ingredients-list">
                      {matchedIngredients.map((item, index) => (
                        <li key={index} className="list-item">
                          <span className="item-number">{index + 1}.</span>
                          <span className="item-content">
                            <strong>{item.ingredient}</strong>
                            
                            {item.details ? (
                              <div className="item-details found">
                                <i>Category: {item.details.category || "N/A"}</i> <br />
                                <b>Function:</b> {item.details.function || "N/A"} | <b>Safety:</b>{" "}
                                <strong>{item.details.safety_level || "Unknown"}</strong>
                                
                                {item.details.warnings && (
                                  <div className="item-warning">
                                    <b>Warning:</b> {item.details.warnings}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="item-details not-found">
                                Not found in ingredient database
                              </div>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="placeholder-text list-placeholder">
                    No recognizable ingredients were detected. Please re-upload or try
                    enhancing the image clarity.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IngredientResults;