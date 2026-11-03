/**
 * BlogCraft AI — Interactive Frontend Logic
 * Orchestrated with LangChain LCEL & FastAPI Backend
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── DOM ELEMENTS ─────────────────────────────────────────
  const inputCard = document.getElementById('inputCard');
  const topicInput = document.getElementById('topicInput');
  const charCount = document.getElementById('charCount');
  const languageInput = document.getElementById('languageInput');
  const generateBtn = document.getElementById('generateBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const formErrorMsg = document.getElementById('formErrorMsg');
  const quickChips = document.querySelectorAll('.quick-chip');

  // Tone & Length selectors
  const toneGroup = document.getElementById('toneGroup');
  const lengthGroup = document.getElementById('lengthGroup');

  // Progress Steps & Connectors
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const trackFill1 = document.getElementById('trackFill1');
  const trackFill2 = document.getElementById('trackFill2');

  // Output Panel Elements
  const outputCard = document.getElementById('outputCard');
  const liveStatusBadge = document.getElementById('liveStatusBadge');
  const outputStatusSubtitle = document.getElementById('outputStatusSubtitle');
  const generatedTitleWrapper = document.getElementById('generatedTitleWrapper');
  const generatedTitleText = document.getElementById('generatedTitleText');
  const contentViewport = document.getElementById('contentViewport');
  const emptyState = document.getElementById('emptyState');
  const markdownOutput = document.getElementById('markdownOutput');
  const streamingCursor = document.getElementById('streamingCursor');

  // Meta Badges
  const metaDate = document.getElementById('metaDate');
  const metaTone = document.getElementById('metaTone');
  const metaReadTime = document.getElementById('metaReadTime');
  const metaWords = document.getElementById('metaWords');

  // Action Bar & Filepath
  const actionBar = document.getElementById('actionBar');
  const copyBtn = document.getElementById('copyBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const savedFilepathRow = document.getElementById('savedFilepathRow');
  const savedFilepathText = document.getElementById('savedFilepathText');

  // Toast & Cursor
  const toastNotification = document.getElementById('toastNotification');
  const cursorSpotlight = document.getElementById('cursorSpotlight');

  // ── STATE VARIABLES ──────────────────────────────────────
  let selectedTone = 'Professional';
  let selectedLength = 'Medium';
  let isGenerating = false;
  let currentTitle = '';
  let fullBlogContent = '';
  let savedFilepath = '';
  let toastTimeout = null;

  // Initialize Date Badge
  const today = new Date();
  metaDate.textContent = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // ── 1. INTERACTIVE MOUSE / TOUCH SPOTLIGHT LIGHT EFFECT ───
  // Creates dynamic glow following cursor or touch
  const glowCards = document.querySelectorAll('.glow-card');

  function updateSpotlight(x, y) {
    if (cursorSpotlight) {
      cursorSpotlight.style.left = `${x}px`;
      cursorSpotlight.style.top = `${y}px`;
    }

    glowCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardX = x - rect.left;
      const cardY = y - rect.top;
      card.style.setProperty('--mouse-x', `${cardX}px`);
      card.style.setProperty('--mouse-y', `${cardY}px`);
    });
  }

  window.addEventListener('pointermove', (e) => {
    updateSpotlight(e.clientX, e.clientY);
  });

  window.addEventListener('pointerdown', (e) => {
    updateSpotlight(e.clientX, e.clientY);
  });

  // ── 2. CLICK RIPPLE EFFECT ON BUTTONS ────────────────────
  function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) existingRipple.remove();

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  // ── 3. PILL TOGGLE SELECTION (TONE & LENGTH) ─────────────
  function setupPillGroup(groupElement, onSelect) {
    const buttons = groupElement.querySelectorAll('.pill-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        createRipple(e);
        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        const val = btn.getAttribute('data-value');
        onSelect(val);
      });
    });
  }

  setupPillGroup(toneGroup, (val) => {
    selectedTone = val;
    metaTone.textContent = val;
  });

  setupPillGroup(lengthGroup, (val) => {
    selectedLength = val;
  });

  // ── 4. TEXTAREA AUTO-RESIZE & CHARACTER COUNTER ──────────
  function autoResizeTextarea() {
    topicInput.style.height = 'auto';
    topicInput.style.height = `${Math.min(Math.max(topicInput.scrollHeight, 85), 200)}px`;
  }

  topicInput.addEventListener('input', () => {
    autoResizeTextarea();
    const len = topicInput.value.length;
    charCount.textContent = `${len}/500`;

    // Clear error message if user starts typing
    if (len > 0) {
      hideError();
    }
  });

  // Quick suggestion chips
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      topicInput.value = chip.getAttribute('data-topic');
      autoResizeTextarea();
      charCount.textContent = `${topicInput.value.length}/500`;
      hideError();
      topicInput.focus();
    });
  });

  // ── 5. ERROR STATE HANDLING ──────────────────────────────
  function showError(msg) {
    inputCard.style.borderColor = 'rgba(239, 68, 68, 0.6)';
    inputCard.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.25)';
    formErrorMsg.querySelector('.error-text').textContent = msg;
    formErrorMsg.classList.remove('hidden');
    topicInput.focus();
  }

  function hideError() {
    inputCard.style.borderColor = '';
    inputCard.style.boxShadow = '';
    formErrorMsg.classList.add('hidden');
  }

  // ── 6. PROGRESS STEPS STATE CONTROLLER ───────────────────
  function resetProgressSteps() {
    [step1, step2, step3].forEach(step => {
      step.classList.remove('active', 'completed');
      step.querySelector('.step-status').textContent = 'Waiting';
    });
    trackFill1.classList.remove('filled');
    trackFill2.classList.remove('filled');
  }

  function setStepActive(stepNum) {
    if (stepNum === 1) {
      step1.classList.add('active');
      step1.classList.remove('completed');
      step1.querySelector('.step-status').textContent = 'Crafting Title...';
    } else if (stepNum === 2) {
      step1.classList.remove('active');
      step1.classList.add('completed');
      step1.querySelector('.step-status').textContent = 'Completed';
      trackFill1.classList.add('filled');

      step2.classList.add('active');
      step2.classList.remove('completed');
      step2.querySelector('.step-status').textContent = 'Building Outline...';
    } else if (stepNum === 3) {
      step2.classList.remove('active');
      step2.classList.add('completed');
      step2.querySelector('.step-status').textContent = 'Completed';
      trackFill2.classList.add('filled');

      step3.classList.add('active');
      step3.classList.remove('completed');
      step3.querySelector('.step-status').textContent = 'Streaming Prose...';
    }
  }

  function setAllStepsCompleted() {
    step3.classList.remove('active');
    step3.classList.add('completed');
    step3.querySelector('.step-status').textContent = 'Completed';
    trackFill1.classList.add('filled');
    trackFill2.classList.add('filled');
  }

  // ── 7. METRICS (WORD COUNT & READING TIME) ───────────────
  function updateBlogMetrics(text) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    metaWords.textContent = `${words} words`;

    // Average reading speed: 200 words per minute
    const minutes = Math.max(1, Math.ceil(words / 200));
    metaReadTime.textContent = `${minutes} min read`;
  }

  // ── 8. TOAST NOTIFICATION ────────────────────────────────
  function showToast(title, desc) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastNotification.querySelector('.toast-title').textContent = title;
    toastNotification.querySelector('.toast-desc').textContent = desc;
    toastNotification.classList.add('show');

    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 4500);
  }

  // ── 9. CONFETTI BURST ────────────────────────────────────
  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#8b5cf6', '#a855f7', '#38bdf8', '#10b981']
      });
    }
  }

  // ── 10. GENERATION & SSE STREAMING LOGIC ──────────────────
  async function startBlogGeneration() {
    if (isGenerating) return;

    const topic = topicInput.value.trim();
    if (!topic) {
      showError('Please enter a blog topic to generate content.');
      return;
    }

    const language = languageInput.value.trim() || 'English';

    // UI state: Loading
    isGenerating = true;
    hideError();
    generateBtn.disabled = true;
    generateBtn.querySelector('.btn-content').classList.add('hidden');
    btnSpinner.classList.remove('hidden');

    // Reset output panel
    currentTitle = '';
    fullBlogContent = '';
    savedFilepath = '';
    emptyState.classList.add('hidden');
    markdownOutput.classList.remove('hidden');
    markdownOutput.innerHTML = '';
    streamingCursor.classList.remove('hidden');
    generatedTitleWrapper.classList.add('hidden');
    actionBar.classList.add('hidden');
    savedFilepathRow.classList.add('hidden');

    // Status: Streaming
    liveStatusBadge.className = 'status-indicator streaming';
    liveStatusBadge.querySelector('.status-label').textContent = 'Generating...';
    outputStatusSubtitle.textContent = 'Orchestrating LangChain pipeline...';

    // Activate Step 1
    resetProgressSteps();
    setStepActive(1);

    // Scroll smoothly to studio output on mobile
    if (window.innerWidth < 1024) {
      outputCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Determine Backend URL
    // Supports relative /generate/blog/stream when served by FastAPI at /app
    // Or fallback to http://127.0.0.1:8000 if opened from a separate origin
    const apiUrl = window.location.origin.includes('127.0.0.1:8000') || window.location.origin.includes('localhost:8000')
      ? '/generate/blog/stream'
      : 'http://127.0.0.1:8000/generate/blog/stream';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          topic: topic,
          tone: selectedTone,
          length: selectedLength,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let streamBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        streamBuffer += chunkText;

        // Process SSE messages separated by double newline
        const messages = streamBuffer.split('\n\n');
        // Keep the last partial chunk in the buffer
        streamBuffer = messages.pop();

        for (const rawMsg of messages) {
          if (!rawMsg.trim()) continue;

          // SSE format: data: <content>
          // Note: a chunk might have multiple lines or just "data: ..."
          const lines = rawMsg.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            
            // Extract payload after "data:"
            let dataContent = line.slice(5);
            // If there's a leading single space after "data:", remove it unless it's part of word spacing
            if (dataContent.startsWith(' ')) {
              dataContent = dataContent.slice(1);
            }

            handleSSEPayload(dataContent);
          }
        }
      }

      // Process any remaining data in the streamBuffer
      if (streamBuffer.trim()) {
        const lines = streamBuffer.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            let dataContent = line.slice(5);
            if (dataContent.startsWith(' ')) dataContent = dataContent.slice(1);
            handleSSEPayload(dataContent);
          }
        }
      }

      // Generation finished successfully
      finishGeneration();

    } catch (err) {
      console.error('Generation failed:', err);
      handleGenerationError(err);
    }
  }

  // Handle parsed SSE tags and text chunks
  function handleSSEPayload(data) {
    // 1. Try parsing JSON format sent by api.py
    try {
      const parsed = JSON.parse(data);
      if (parsed.event === 'title') {
        currentTitle = (parsed.data || '').trim().replace(/^#+\s*/, '').replace(/^["']|["']$/g, '');
        generatedTitleText.textContent = currentTitle;
        generatedTitleWrapper.classList.remove('hidden');
        metaTone.textContent = selectedTone;

        setStepActive(2);
        outputStatusSubtitle.textContent = 'Building comprehensive outline...';
        return;
      }
      if (parsed.event === 'outline_done') {
        setStepActive(3);
        const sectionCount = parsed.data && parsed.data.sections ? parsed.data.sections.length : null;
        outputStatusSubtitle.textContent = sectionCount 
          ? `Outline ready (${sectionCount} sections) • Streaming full article...`
          : 'Streaming full article live...';
        liveStatusBadge.className = 'status-indicator streaming';
        liveStatusBadge.querySelector('.status-label').textContent = 'Streaming...';
        return;
      }
      if (parsed.event === 'chunk') {
        fullBlogContent += parsed.data;
        renderMarkdownLive();
        return;
      }
      if (parsed.event === 'done') {
        savedFilepath = parsed.filepath || '';
        if (savedFilepath) {
          savedFilepathText.textContent = savedFilepath;
          savedFilepathRow.classList.remove('hidden');
        }
        setAllStepsCompleted();
        return;
      }
    } catch (e) {
      // Fall through to legacy format
    }

    // 2. Legacy fallback
    if (data.startsWith('[TITLE]')) {
      // Step 1 Completed -> Title Received
      currentTitle = data.replace('[TITLE]', '').trim();
      currentTitle = currentTitle.replace(/^#+\s*/, '').replace(/^["']|["']$/g, '');
      generatedTitleText.textContent = currentTitle;
      generatedTitleWrapper.classList.remove('hidden');
      metaTone.textContent = selectedTone;

      setStepActive(2);
      outputStatusSubtitle.textContent = 'Crafting comprehensive outline...';

    } else if (data.trim() === '[OUTLINE_DONE]') {
      // Step 2 Completed -> Start Step 3 (Streaming Blog)
      setStepActive(3);
      outputStatusSubtitle.textContent = 'Streaming full article live...';
      liveStatusBadge.className = 'status-indicator streaming';
      liveStatusBadge.querySelector('.status-label').textContent = 'Streaming...';

    } else if (data.startsWith('[DONE]')) {
      // Step 4 Completed -> Save Filepath
      savedFilepath = data.replace('[DONE]', '').trim();
      if (savedFilepath) {
        savedFilepathText.textContent = savedFilepath;
        savedFilepathRow.classList.remove('hidden');
      }
      setAllStepsCompleted();

    } else {
      // Content chunk — append to markdown text
      fullBlogContent += data;
      renderMarkdownLive();
    }
  }

  // Render markdown in real-time
  function renderMarkdownLive() {
    // Strip duplicate '# Title' at start of content since it is already displayed in the styled header
    let displayContent = fullBlogContent;
    if (currentTitle) {
      displayContent = displayContent.replace(/^#\s+[^\n]+\n*/, '');
    }

    if (typeof marked !== 'undefined') {
      marked.setOptions({
        gfm: true,
        breaks: false
      });
      markdownOutput.innerHTML = marked.parse(displayContent);
    } else {
      markdownOutput.textContent = displayContent;
    }

    // Update word count & reading time
    updateBlogMetrics(fullBlogContent);

    // Auto-scroll output to bottom smoothly while streaming
    contentViewport.scrollTop = contentViewport.scrollHeight;
  }

  // Generation completion handler
  function finishGeneration() {
    isGenerating = false;
    generateBtn.disabled = false;
    generateBtn.querySelector('.btn-content').classList.remove('hidden');
    btnSpinner.classList.add('hidden');

    streamingCursor.classList.add('hidden');
    setAllStepsCompleted();

    // Status: Done
    liveStatusBadge.className = 'status-indicator done';
    liveStatusBadge.querySelector('.status-label').textContent = 'Finished';
    outputStatusSubtitle.textContent = 'Article ready for export';

    // Show Action Bar
    actionBar.classList.remove('hidden');

    // Trigger celebration confetti & toast
    triggerConfetti();
    showToast('🎉 Blog Generated Successfully!', 'Your complete article has been streamed and saved.');
  }

  // Error handler
  function handleGenerationError(err) {
    isGenerating = false;
    generateBtn.disabled = false;
    generateBtn.querySelector('.btn-content').classList.remove('hidden');
    btnSpinner.classList.add('hidden');
    streamingCursor.classList.add('hidden');

    liveStatusBadge.className = 'status-indicator';
    liveStatusBadge.querySelector('.status-label').textContent = 'Error';
    outputStatusSubtitle.textContent = 'Connection or generation error occurred';

    showError(`Failed to generate blog: ${err.message || 'Make sure FastAPI backend is running on port 8000.'}`);
  }

  // ── 11. ACTION BAR BUTTONS (COPY, DOWNLOAD, RESET) ───────
  
  // Copy to Clipboard
  copyBtn.addEventListener('click', async (e) => {
    createRipple(e);
    if (!fullBlogContent && !currentTitle) return;

    const fullText = `# ${currentTitle}\n\n${fullBlogContent}`;

    try {
      await navigator.clipboard.writeText(fullText);
      const originalHtml = copyBtnText.textContent;
      copyBtnText.textContent = '✅ Copied!';
      copyBtn.style.borderColor = 'var(--color-success)';

      setTimeout(() => {
        copyBtnText.textContent = originalHtml;
        copyBtn.style.borderColor = '';
      }, 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      // Fallback using textarea
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      copyBtnText.textContent = '✅ Copied!';
      setTimeout(() => { copyBtnText.textContent = 'Copy to Clipboard'; }, 2000);
    }
  });

  // Download .md File
  downloadBtn.addEventListener('click', (e) => {
    createRipple(e);
    if (!fullBlogContent && !currentTitle) return;

    const fullText = `# ${currentTitle}\n\n${fullBlogContent}`;
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Slugify filename from title
    const filename = (currentTitle || 'blog-post')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '.md';

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('⬇️ Download Started', `Saved as ${filename}`);
  });

  // Generate Another / Reset
  resetBtn.addEventListener('click', (e) => {
    createRipple(e);
    topicInput.value = '';
    charCount.textContent = '0/500';
    autoResizeTextarea();

    emptyState.classList.remove('hidden');
    markdownOutput.classList.add('hidden');
    markdownOutput.innerHTML = '';
    generatedTitleWrapper.classList.add('hidden');
    actionBar.classList.add('hidden');
    savedFilepathRow.classList.add('hidden');

    resetProgressSteps();

    liveStatusBadge.className = 'status-indicator';
    liveStatusBadge.querySelector('.status-label').textContent = 'Ready';
    outputStatusSubtitle.textContent = 'Live preview rendered in Markdown';

    // Smooth scroll back to input panel
    inputCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    topicInput.focus();
  });

  // ── 12. EVENT LISTENERS ──────────────────────────────────
  generateBtn.addEventListener('click', (e) => {
    createRipple(e);
    startBlogGeneration();
  });

  // Hero CTA button scroll
  const heroCtaBtn = document.getElementById('heroCtaBtn');
  if (heroCtaBtn) {
    heroCtaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
      topicInput.focus();
    });
  }

  // Allow Ctrl+Enter or Cmd+Enter to trigger generation
  topicInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      startBlogGeneration();
    }
  });

});

