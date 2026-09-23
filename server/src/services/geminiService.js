let GoogleGenAIClass = null;

async function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  const isEnabled = process.env.GEMINI_ENABLED !== 'false';
  if (!apiKey || !isEnabled) return null;

  try {
    if (!GoogleGenAIClass) {
      const genaiModule = await import('@google/genai');
      GoogleGenAIClass = genaiModule.GoogleGenAI;
    }
    return new GoogleGenAIClass({ apiKey });
  } catch (error) {
    console.error('Unable to initialize Google GenAI SDK:', error.message);
    return null;
  }
}

function buildSourceContext(resource, findings = [], evidenceLinks = []) {
  const lines = [
    `=== AUTHORITATIVE RESEARCH SOURCE ===`,
    `Title: ${resource.title}`,
    `Document Type: ${resource.type || resource.documentType || 'Research Paper'}`,
    `Region: ${resource.region || 'Not specified'}`,
    `Research Area: ${resource.researchArea || 'Not specified'}`,
    `Year: ${resource.year || 'Unknown'}`,
    `Authors: ${(resource.authors && resource.authors.length) ? resource.authors.join(', ') : 'Not listed'}`,
    `Source / Publisher: ${resource.source || resource.sourceOrganization || 'Polar India Hub Archive'}`,
    `Source URL / DOI: ${resource.sourceUrl || resource.fileUrl || 'N/A'}`,
    `Verification Status: ${resource.verificationStatus || 'Prototype Demo Content'}`,
    `Overview: ${resource.description || 'No abstract available.'}`
  ];

  if (resource.contentText) {
    lines.push(`Full / Extracted Text:\n${resource.contentText.slice(0, 8000)}`);
  }

  if (findings.length > 0) {
    lines.push(`\n=== SOURCE FINDINGS (${findings.length}) ===`);
    findings.forEach((f, idx) => {
      lines.push(
        `Finding [${idx + 1}] (ID: ${f._id}):\nTitle: ${f.title}\nDescription: ${f.description || ''}\nImportance: ${f.importance || 'medium'}\nEvidence Link IDs: ${(f.evidenceLinks || []).map(String).join(', ') || 'None'}`
      );
    });
  }

  if (evidenceLinks.length > 0) {
    lines.push(`\n=== LINKED EVIDENCE RECORDS (${evidenceLinks.length}) ===`);
    evidenceLinks.forEach((link, idx) => {
      lines.push(`Evidence Record [${idx + 1}] (ID: ${link._id}): Relationship: ${link.relationship || 'supports'}`);
      if (link.dataset) {
        lines.push(` - Dataset: ${link.dataset.title || link.dataset.name || link.dataset} (Variables: ${(link.dataset.variables || []).join(', ')})`);
      }
      if (link.observation) {
        lines.push(` - Observation: ${link.observation.title || link.observation.name || link.observation} (Value: ${link.observation.value} ${link.observation.unit || ''})`);
      }
      if (link.station) {
        lines.push(` - Station: ${link.station.name || link.station.code || link.station} (${link.station.region || ''})`);
      }
      if (link.expedition) {
        lines.push(` - Expedition: ${link.expedition.title || link.expedition.code || link.expedition}`);
      }
      if (link.publication) {
        lines.push(` - Publication: ${link.publication.title || link.publication} (${link.publication.year || ''})`);
      }
      if (link.media) {
        lines.push(` - Media: ${link.media.title || link.media} (${link.media.type || ''})`);
      }
      if (link.note) {
        lines.push(` - Note: ${link.note}`);
      }
    });
  }

  return lines.join('\n');
}

function getPrototypeAnalysis(resource, findings = [], relatedResources = []) {
  return {
    mode: 'prototype-fallback',
    resourceId: resource._id,
    disclaimer: process.env.GEMINI_API_KEY
      ? 'AI service unavailable — showing prototype contextual analysis. Original research remains authoritative.'
      : 'AI service is not configured — showing prototype contextual analysis. Original research remains authoritative.',
    summary: resource.description || 'Prototype Demo Content — no summary is available for this resource.',
    keyFindings: findings.map((finding) => ({
      findingId: String(finding._id),
      title: finding.title,
      text: finding.description || finding.title,
      evidenceLinkIds: (finding.evidenceLinks || []).map(String),
      sourceLabel: 'AI claim linked to source evidence'
    })),
    simpleExplanation: `This polar research explores ${resource.researchArea || 'cryospheric and environmental phenomena'} in the ${resource.region || 'polar'} region. It establishes an evidence trail connecting field observations, stations, and datasets. Review the original source and linked evidence before drawing conclusions.`,
    importantTerms: [resource.region, resource.researchArea, resource.type, resource.sourceOrganization].filter(Boolean),
    relatedResources: relatedResources.map((r) => ({ _id: r._id, title: r.title, type: r.type })),
    sourceNotes: [
      `Original Source: ${resource.source || 'Polar India Hub'}`,
      `Document Type: ${resource.type || 'Research Resource'}`
    ]
  };
}

async function analyzeResource({ resource, findings = [], evidenceLinks = [], relatedResources = [] }) {
  const client = await getGenAIClient();
  if (!client) {
    return getPrototypeAnalysis(resource, findings, relatedResources);
  }

  const sourceContext = buildSourceContext(resource, findings, evidenceLinks);
  const prompt = `SYSTEM:
You are the Polar India Hub AI Research Assistant for MoES/NCPOR Indian polar science.
DATA TRUST RULE:
THE ORIGINAL RESEARCH SOURCE IS AUTHORITATIVE. AI is only an understanding layer.
Every statement MUST be strictly grounded in the supplied research context.
Never invent scientific findings, dataset values, expedition details, station observations, authors, dates, citations, or unsupported conclusions.
If specific information is not in the context, do not make it up.

RESEARCH CONTEXT:
${sourceContext}

TASK:
Perform a structured analysis of this polar research document and return valid JSON with these EXACT keys:
- "summary": A concise, accurate, scientific 2-4 sentence summary of what this research established.
- "keyFindings": An array of objects each having:
    - "findingId": The exact ID of the matching Finding from the context if found (e.g. from SOURCE FINDINGS), or empty string.
    - "title": Short title of the finding.
    - "text": 1-2 sentence evidence-grounded finding statement.
    - "evidenceLinkIds": Array of matching Evidence Record IDs from the context.
    - "sourceLabel": "AI claim linked to source evidence"
- "simpleExplanation": A clear, educational explanation in accessible language suitable for students, preserving scientific precision.
- "importantTerms": Array of 3 to 6 key scientific terms / keywords explicitly present in the source.
- "sourceNotes": Array of 1-3 source citations or methodological notes from the text.
- "disclaimer": "AI-assisted understanding; original research remains authoritative."

Return ONLY valid JSON.`;

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const rawText = response.text?.trim() || '{}';
    let parsed = JSON.parse(rawText);

    // Validate structured response
    if (!parsed.summary) {
      parsed.summary = resource.description || 'Summary derived from selected research resource.';
    }
    if (!Array.isArray(parsed.keyFindings) || parsed.keyFindings.length === 0) {
      parsed.keyFindings = findings.map((f) => ({
        findingId: String(f._id),
        title: f.title,
        text: f.description || f.title,
        evidenceLinkIds: (f.evidenceLinks || []).map(String),
        sourceLabel: 'AI claim linked to source evidence'
      }));
    }
    if (!parsed.simpleExplanation) {
      parsed.simpleExplanation = `This resource examines ${resource.researchArea || 'polar science'} in the ${resource.region || 'polar'} region.`;
    }
    if (!Array.isArray(parsed.importantTerms)) {
      parsed.importantTerms = [resource.region, resource.researchArea, resource.type].filter(Boolean);
    }

    return {
      mode: 'gemini-ai',
      resourceId: resource._id,
      disclaimer: parsed.disclaimer || 'AI-assisted understanding; original research remains authoritative.',
      summary: parsed.summary,
      keyFindings: parsed.keyFindings,
      simpleExplanation: parsed.simpleExplanation,
      importantTerms: parsed.importantTerms,
      relatedResources: relatedResources.map((r) => ({ _id: r._id, title: r.title, type: r.type })),
      sourceNotes: parsed.sourceNotes || [`Source: ${resource.source || 'NCPOR / Polar India Hub'}`]
    };
  } catch (error) {
    console.error('Gemini analyzeResource error:', error.message);
    return getPrototypeAnalysis(resource, findings, relatedResources);
  }
}

async function chatAboutResource({ resource, findings = [], evidenceLinks = [], message }) {
  const client = await getGenAIClient();
  const firstFinding = findings[0];

  if (!client) {
    return {
      mode: 'prototype-fallback',
      resourceId: resource._id,
      answer: `AI service is not configured — showing prototype contextual analysis.\n\nRegarding "${message}": In the context of "${resource.title}", observations and findings connect to field records and datasets in ${resource.region || 'the polar region'}. Original research remains authoritative.`,
      claim: firstFinding ? {
        findingId: String(firstFinding._id),
        title: firstFinding.title,
        text: firstFinding.description || firstFinding.title,
        evidenceLinkIds: (firstFinding.evidenceLinks || []).map(String),
        sourceLabel: 'AI claim linked to source evidence'
      } : null,
      disclaimer: 'AI service is not configured — showing prototype contextual analysis.'
    };
  }

  const sourceContext = buildSourceContext(resource, findings, evidenceLinks);
  const prompt = `SYSTEM:
You are the Polar India Hub AI Research Assistant.
DATA TRUST RULE:
THE ORIGINAL RESEARCH SOURCE IS AUTHORITATIVE. AI is only an understanding layer.
Use ONLY the supplied research context to answer the user's question.
Never invent scientific findings, numbers, dates, locations, or citations.
CRITICAL: If the question asks for information not present in the supplied research context, you MUST answer:
"I could not verify that from the selected research source."

RESEARCH CONTEXT:
${sourceContext}

USER QUESTION:
${message}

TASK:
Respond with valid JSON containing:
- "answer": Your evidence-grounded answer (or "I could not verify that from the selected research source." if not verified in context).
- "supportedByFindingId": The ID of the most relevant finding if applicable, or empty string.
- "findingTitle": Title of the supporting finding, or empty string.
- "findingText": Short summary of the supporting finding, or empty string.
- "disclaimer": "AI-assisted understanding; original research remains authoritative."

Return ONLY valid JSON.`;

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    const findingId = parsed.supportedByFindingId || (firstFinding ? String(firstFinding._id) : null);
    const matchedFinding = findings.find((f) => String(f._id) === String(findingId)) || firstFinding;

    return {
      mode: 'gemini-ai',
      resourceId: resource._id,
      answer: parsed.answer || 'I could not verify that from the selected research source.',
      claim: matchedFinding ? {
        findingId: String(matchedFinding._id),
        title: parsed.findingTitle || matchedFinding.title,
        text: parsed.findingText || matchedFinding.description || matchedFinding.title,
        evidenceLinkIds: (matchedFinding.evidenceLinks || []).map(String),
        sourceLabel: 'AI claim linked to source evidence'
      } : null,
      disclaimer: parsed.disclaimer || 'AI-assisted understanding; original research remains authoritative.'
    };
  } catch (error) {
    console.error('Gemini chatAboutResource error:', error.message);
    return {
      mode: 'prototype-fallback',
      resourceId: resource._id,
      answer: `Unable to connect to AI service — fallback response: Your inquiry regarding "${message}" relates to "${resource.title}" (${resource.region || 'Polar'}). Please review the source-linked findings directly.`,
      claim: firstFinding ? {
        findingId: String(firstFinding._id),
        title: firstFinding.title,
        text: firstFinding.description || firstFinding.title,
        evidenceLinkIds: (firstFinding.evidenceLinks || []).map(String),
        sourceLabel: 'AI claim linked to source evidence'
      } : null,
      disclaimer: 'AI service unavailable — original research remains authoritative.'
    };
  }
}

async function generateOutreachContent({ resource, findings = [], evidenceLinks = [], format, title }) {
  const client = await getGenAIClient();
  const sourceName = resource.source || resource.sourceOrganization || 'Polar India Hub Archive';
  const evidenceTitles = evidenceLinks.map((link) => {
    if (link.dataset) return `Dataset: ${link.dataset.title || link.dataset.name || 'Field Dataset'}`;
    if (link.observation) return `Observation: ${link.observation.title || link.observation.name || 'Observation'}`;
    if (link.station) return `Station: ${link.station.name || 'Polar Station'}`;
    return link.note || 'Evidence link';
  });

  const fallbackBodies = {
    'Instagram Post': `🧊 Polar Science in Focus: ${resource.title}\n\nKey Insight: ${resource.description || 'Recent polar measurements shed light on cryospheric shifts.'}\n\n📍 Region: ${resource.region || 'Polar'}\n📊 Evidence Trail: Connected to ${evidenceTitles.length ? evidenceTitles.slice(0, 2).join(' & ') : 'verified field observations'}.\n\n📖 Read the authoritative study at Polar India Hub.\nSource: ${sourceName}`,
    '60-sec Video Script': `[00:00 - 00:10 Hook]\n"What does ice in the ${resource.region || 'polar'} region tell us about global climate?"\n\n[00:10 - 00:30 Context & Research]\nResearchers examined: ${resource.title}. ${resource.description || 'Field observations reveal critical dynamics in environmental stability.'}\n\n[00:30 - 00:45 Evidence Trace]\nObservations recorded at Indian stations and verified datasets support these conclusions: ${evidenceTitles[0] || 'Linked field measurements'}.\n\n[00:45 - 01:00 Closing & Source]\n"Remember: scientific claims must trace back to real evidence. Explore the full study on Polar India Hub."\nSource: ${sourceName}`,
    'School Presentation': `Slide 1 — Title & Topic\nResearch: ${resource.title}\nRegion: ${resource.region || 'Antarctica / Arctic'} | Domain: ${resource.researchArea || 'Cryosphere'}\n\nSlide 2 — The Research Question\nWhat phenomena did Indian polar researchers investigate?\n${resource.description || 'Investigating key polar dynamics and environmental indicators.'}\n\nSlide 3 — The Evidence Trail\nHow do we know? We trace findings to:\n${evidenceTitles.length ? evidenceTitles.map((t) => `• ${t}`).join('\n') : '• Linked observations and datasets'}\n\nSlide 4 — Conclusion & Authority\nAlways refer back to the original publication: ${sourceName}.`,
    'Infographic': `TITLE: ${resource.title}\n\nKEY MESSAGE:\n${resource.description || 'Key findings from India’s polar research campaign.'}\n\nEVIDENCE MILESTONES:\n${evidenceTitles.length ? evidenceTitles.map((e, i) => `${i + 1}. ${e}`).join('\n') : '1. Field Observation\n2. Calibrated Dataset\n3. Peer-reviewed Finding'}\n\nSOURCE ATTRIBUTION:\nPublished by ${sourceName} (${resource.year || 'Current'})\nPolar India Hub — Original research remains authoritative.`,
    'Quiz': `QUESTION:\nAccording to the research "${resource.title}", what is the primary evidence basis for this study?\n\nOPTIONS:\nA) ${evidenceTitles[0] || 'Linked field observations and station data'}\nB) An unverified social media report\nC) Random speculation without observations\nD) Hypothetical modeling with no ground truth\n\nCORRECT ANSWER: A\n\nEXPLANATION:\nScientific understanding is grounded in verified datasets and field observations recorded by research teams. Source: ${sourceName}.`
  };

  if (!client) {
    return {
      content: fallbackBodies[format] || fallbackBodies['Instagram Post'],
      mode: 'prototype-fallback',
      sourceLabel: `Based on selected research/evidence: ${resource.title} (${sourceName})`,
      evidenceUsed: evidenceTitles
    };
  }

  const sourceContext = buildSourceContext(resource, findings, evidenceLinks);
  const prompt = `SYSTEM:
You are the Polar India Hub Science Outreach Creator.
DATA TRUST RULE:
THE ORIGINAL RESEARCH SOURCE IS AUTHORITATIVE.
Generate an engaging, accurate science communication piece strictly grounded in the provided research.
Do NOT invent unsupported facts or numbers.
Format requested: ${format}

RESEARCH CONTEXT:
${sourceContext}

TASK:
Generate the draft for "${format}".
- For "Instagram Post": Compelling hook, 2-3 concise informative paragraphs, hashtags (#PolarScience #MoES #NCPOR), explicit source attribution.
- For "60-sec Video Script": Timestamped sections (Hook, Context, Evidence, Explanation, Closing).
- For "School Presentation": 4 clear structured slides with bullets.
- For "Infographic": Title, Key Message, 3-4 Evidence Points, and Source Attribution.
- For "Quiz": 1 multiple-choice question testing understanding of the research, 4 options (A-D), Correct Answer, and Explanation citing the source.

Return JSON with keys:
- "title": Title of the outreach piece
- "content": Full text of the generated draft
- "sourceAttribution": Formal citation of the original source
- "evidenceBasis": Array of evidence items used from context

Return ONLY valid JSON.`;

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return {
      content: parsed.content || fallbackBodies[format] || fallbackBodies['Instagram Post'],
      title: parsed.title || title || `${format} — ${resource.title}`,
      mode: 'gemini-ai',
      sourceLabel: `Based on selected research/evidence: ${resource.title} (${parsed.sourceAttribution || sourceName})`,
      evidenceUsed: parsed.evidenceBasis || evidenceTitles
    };
  } catch (error) {
    console.error('Gemini outreach generation error:', error.message);
    return {
      content: fallbackBodies[format] || fallbackBodies['Instagram Post'],
      mode: 'prototype-fallback',
      sourceLabel: `Based on selected research/evidence: ${resource.title} (${sourceName})`,
      evidenceUsed: evidenceTitles
    };
  }
}

module.exports = {
  analyzeResource,
  chatAboutResource,
  generateOutreachContent,
  buildSourceContext,
  getPrototypeAnalysis
};
