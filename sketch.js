let video, poseModel, points = 0, actionActive = false;
let petState = 'idle', timer = 0;
let mediaRecorder, recordedChunks = [];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  loadModel();
  mediaRecorder = new MediaRecorder(video.elt.captureStream());
  mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
}

async function loadModel() {
  poseModel = await tf.loadGraphModel('models/pose_model/model.json');
  console.log('Pose model loaded');
}

function draw() {
  if (!actionActive) return;
  push();
  tint(255, 100, 255); // Neon filter
  image(video, 0, 0);
  pop();
  if (millis() - timer > 15000) endAction();
  detectPosePop();
}

async function detectPosePop() {
  if (!poseModel) return;
  let pred = await poseModel.predict(video.elt);
  if (pred[0].className === 'Superhero') {
    points += 10;
    updatePet('happy');
    new Audio('assets/win.mp3').play();
  }
  document.getElementById('points').textContent = `Trend Points: ${points}`;
}

function startPosePop() {
  actionActive = true;
  timer = millis();
  recordedChunks = [];
  mediaRecorder.start();
  document.getElementById('prompt').textContent = 'Strike a Superhero Pose!';
}

function endAction() {
  actionActive = false;
  mediaRecorder.stop();
  document.getElementById('prompt').textContent = 'Action Done! Share Your Trend!';
  updatePet('idle');
}

function updatePet(state) {
  petState = state;
  let petImg = document.getElementById('pet');
  petImg.src = state === 'happy' ? 'assets/pet_happy.png' : 'assets/pet.png';
}

function shareTrend() {
  let blob = new Blob(recordedChunks, { type: 'video/webm' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'trendseed.webm';
  a.click();
  alert('Share your TrendSeed with #TrendTamer!');
}