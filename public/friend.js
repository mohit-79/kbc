// ==========================================================================
// SurKBC — friend.js (Phone-a-Friend Client Engine)
// ==========================================================================

const params = new URLSearchParams(window.location.search);
const sessionId = params.get('session');
const token = params.get('token');

let selectedOptionIndex = null;
let questionData = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!sessionId || !token) {
    showError("Invalid Link", "Link me session ya token missing hai.");
    return;
  }

  // Setup Jitsi Audio & Video Call Links (Triggers auto-connect for player)
  const audioLink = document.getElementById('link-audio-call');
  const videoLink = document.getElementById('link-video-call');
  if (audioLink) {
    audioLink.href = `/call?session=${encodeURIComponent(sessionId)}&mode=audio`;
  }
  if (videoLink) {
    videoLink.href = `/call?session=${encodeURIComponent(sessionId)}&mode=video`;
  }

  try {
    const res = await fetch(`/api/phone-friend/question?session=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`);
    const data = await res.json();

    if (!res.ok) {
      if (data.status === 'expired') {
        showError("Link Expire Ho Gaya Hai", "Ye link 5 minute ke liye valid tha. Sawaal ka samay samapt ho chuka hai.");
      } else {
        showError("Sawaal Nahi Mila", data.error || "Is request ki jaankari nahi mili.");
      }
      return;
    }

    questionData = data;

    if (data.status === 'answered') {
      showSuccess(data.answer, data.note, true);
      return;
    }

    renderQuestion(data);

  } catch (err) {
    showError("Network Error", "Server se connect nahi ho saka. Kripya refresh karein.");
  }
});

function renderQuestion(data) {
  document.getElementById('loading-state').style.display = 'none';
  const content = document.getElementById('portal-content');
  content.style.display = 'flex';

  const greeting = document.getElementById('friend-greeting');
  if (greeting && data.friendName) {
    greeting.textContent = `Namaste ${data.friendName}! Aapke dost ko is sawaal par madad chahiye:`;
  }

  const qText = document.getElementById('portal-q-text');
  if (qText) {
    qText.textContent = data.question;
  }

  const list = document.getElementById('portal-options-list');
  if (list && Array.isArray(data.options)) {
    const letters = ["A", "B", "C", "D"];
    list.innerHTML = data.options.map((opt, idx) => `
      <button class="friend-opt-btn" id="opt-btn-${idx}" onclick="selectOption(${idx})">
        <span style="color: var(--gold-primary); font-weight: 800; margin-right: 10px;">${letters[idx]}:</span>
        <span>${escapeHtml(opt)}</span>
      </button>
    `).join('');
  }
}

window.selectOption = function(idx) {
  selectedOptionIndex = idx;
  document.querySelectorAll('.friend-opt-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === idx);
  });
};

window.submitFriendAnswer = async function() {
  if (selectedOptionIndex === null) {
    alert("Kripya pehle ek option chunein (A, B, C, ya D)!");
    return;
  }

  const btn = document.getElementById('btn-submit-answer');
  btn.disabled = true;
  btn.textContent = "Bheja ja raha hai...";

  const note = (document.getElementById('portal-note-input').value || "").trim();
  const letters = ["A", "B", "C", "D"];
  const chosenLetter = letters[selectedOptionIndex];

  try {
    const res = await fetch('/api/phone-friend/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        token,
        selectedOption: chosenLetter,
        note
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showSuccess(chosenLetter, note);
    } else {
      alert("Error: " + (data.error || "Submit nahi ho saka"));
      btn.disabled = false;
      btn.textContent = "✅ Uttar Bhejein (Submit)";
    }
  } catch (err) {
    alert("Network error. Kripya dobara koshish karein.");
    btn.disabled = false;
    btn.textContent = "✅ Uttar Bhejein (Submit)";
  }
};

function showSuccess(choice, note, alreadySubmitted = false) {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('portal-content').style.display = 'none';
  document.getElementById('error-state').style.display = 'none';

  const successEl = document.getElementById('success-state');
  successEl.style.display = 'block';

  const detail = document.getElementById('success-detail-text');
  if (detail) {
    detail.textContent = alreadySubmitted
      ? `Aapne pehle hi Option ${choice} chuna tha: ${note ? '"' + note + '"' : ''}`
      : `Aapne Option ${choice} chuna hai! ${note ? 'Salah: "' + note + '"' : ''}`;
  }
}

function showError(title, desc) {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('portal-content').style.display = 'none';
  document.getElementById('success-state').style.display = 'none';

  const errEl = document.getElementById('error-state');
  errEl.style.display = 'block';

  document.getElementById('error-title').textContent = title;
  document.getElementById('error-desc').textContent = desc;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}
