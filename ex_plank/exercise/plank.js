let detector;
let detectorConfig;
let poses;
let video;
let model;
let elbowAngle = 999;
let backAngle = 0;
let legAngle = 999;
let upPosition = false;
let downPosition = false;
let highlightBack = false;
let backWarningGiven = false;
let feedback;
let timer = 0; // 타이머 변수

tf.setBackend('webgl');

async function init() {
  detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER };
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
  edges = {
    '5,7': 'm',
    '7,9': 'm',
    '6,8': 'c',
    '8,10': 'c',
    '5,6': 'y',
    '5,11': 'm', 
    '6,12': 'c',
    '11,12': 'y',
    '11,13': 'm',
    '13,15': 'm',
    '12,14': 'c',
    '14,16': 'c'
  };
  await getPoses();
}
async function videoReady() {
  //console.log('video ready');
}
async function setup() {
  var msg = new SpeechSynthesisUtterance('플랭크 자세를 준비해주세요');
  msg.rate = 0.8
  window.speechSynthesis.speak(msg);
  createCanvas(640, 480);
  video = createCapture(VIDEO, videoReady); // 웹캠에서 비디오 캡쳐
  //video.size(960, 720);
  video.hide();
  await init();
}

async function getPoses() {
  poses = await detector.estimatePoses(video.elt); // video 요소에서 자세 추정
  setTimeout(getPoses, 0); // 콜백함수를 통해 계속해서 자세 추정
  elbowAngle = 999;
  backAngle = 0;
  legAngle = 999;
}
setInterval(()=> {
  console.log(highlightBack, backAngle);
}, 1000)

function draw() {
  background(220);
  translate(width, 0);
  scale(-1, 1); // 좌우 반전
  image(video, 0, 0, video.width, video.height); // 캡처된 비디오를 캔버스에 출력
  drawKeypoints(); // 키 포인트 그림
  drawSkeleton(); // 스켈레톤 그림
  // Write text
  fill(255);
  strokeWeight(2);
  stroke(51);
  translate(width, 0);
  scale(-1, 1);
  textSize(40);

  if (poses && poses.length > 0) {
    // 현재 타이머 값 출력
    console.log(timer);
    let minutes = Math.floor(timer/60); // 분 계산
    let seconds = Math.floor(timer%60); // 초 계산
    let timeString = `Time: ${minutes}m ${seconds}s`; // 분과 초를 문자열로 합쳐 출력
    text(timeString, 100, 90);
    // 타이머 증가
    let feedbackString = feedback;
    text(feedbackString, 100, height - 100);
    timer += 1/180; // 
  }
  else {
    // 현재 프레임에서 감지된 사람이 없을 경우 다시 자세 추정 함수 호출
    getPoses();
    text('사람이 인식되지 않습니다.', 100, 90);
  }
}


function drawKeypoints() {
  var count = 0;
  if (poses && poses.length > 0) {
    for (let kp of poses[0].keypoints) {
      const { x, y, score } = kp;
      if (score > 0.3) {
        count = count + 1;
        fill(255);
        stroke(0);
        strokeWeight(4);
        circle(x, y, 16);
      }
      if (count == 17) {
        //console.log('Whole body visible!');
      }
      else {
        //console.log('Not fully visible!');
      }
      updateArmAngle();
      updateBackAngle();
      updateLegAngle();
      inUpPosition();
      inDownPosition();
    }
  }
}

// 키포인트(관절) 위치에 원, 키포인트를 연결하는 선을 그림
function drawSkeleton() {
  confidence_threshold = 0.5;
  if (poses && poses.length > 0) {
    for (let i = 0; i < poses.length; i++) {  // 모든 인식된 사람에 대해 반복문 실행
      const pose = poses[i];
      for (const [key, value] of Object.entries(edges)) {
        const p = key.split(",");
        const p1 = p[0];
        const p2 = p[1];
        const y1 = pose.keypoints[p1].y;
        const x1 = pose.keypoints[p1].x;
        const c1 = pose.keypoints[p1].score;
        const y2 = pose.keypoints[p2].y;
        const x2 = pose.keypoints[p2].x;
        const c2 = pose.keypoints[p2].score;
        if ((c1 > confidence_threshold) && (c2 > confidence_threshold)) {
          if ((highlightBack == true) && ((p[1] == 11) || ((p[0] == 6) && (p[1] == 12)) || (p[1] == 13) || (p[0] == 12))) {
            strokeWeight(3);
            stroke(255, 0, 0);
            line(x1, y1, x2, y2);
          }
          else {
            strokeWeight(2);
            stroke('rgb(0, 255, 0)');
            line(x1, y1, x2, y2);
          }
        }
      }
    }
  }
}

// 왼팔의 각도를 계산하고 업데이트
function updateArmAngle() {
  let leftWrist, leftShoulder, leftElbow;
  let rightWrist, rightShoulder, rightElbow;

  // 신뢰도가 일정 수준 이상인 왼팔과 오른팔 정보를 각각 찾음
  for (let i = 0; i < poses.length; i++) {
    const keypoints = poses[i].keypoints;
    if (keypoints[9].score > 0.3 && keypoints[5].score > 0.3 && keypoints[7].score > 0.3) {
      leftWrist = keypoints[9];
      leftShoulder = keypoints[5];
      leftElbow = keypoints[7];
    }
    if (keypoints[10].score > 0.3 && keypoints[6].score > 0.3 && keypoints[8].score > 0.3) {
      rightWrist = keypoints[10];
      rightShoulder = keypoints[6];
      rightElbow = keypoints[8];
    }
  }

  // 왼팔의 팔꿈치와 손목, 어깨와 팔꿈치 사이의 각도 계산
  if (leftWrist && leftElbow && leftShoulder) {
    const angle = (
      Math.atan2(
        leftWrist.y - leftElbow.y,
        leftWrist.x - leftElbow.x
      ) - Math.atan2(
        leftShoulder.y - leftElbow.y,
        leftShoulder.x - leftElbow.x
      )
    ) * (180 / Math.PI);
    elbowAngle = angle;
  }

  // 오른팔의 팔꿈치와 손목, 어깨와 팔꿈치 사이의 각도 계산
  if (rightWrist && rightElbow && rightShoulder) {
    const angle = (
      Math.atan2(
        rightWrist.y - rightElbow.y,
        rightWrist.x - rightElbow.x
      ) - Math.atan2(
        rightShoulder.y - rightElbow.y,
        rightShoulder.x - rightElbow.x
      )
    ) * (180 / Math.PI);
    shoulderAngle = angle;
  }
}
// 등 각도를 계산하고 업데이트
function updateBackAngle() {
  let leftShoulder, leftHip, leftKnee;
  let rightShoulder, rightHip, rightKnee ;

  // 신뢰도가 일정 수준 이상인 왼쪽등과 오른쪽등 정보를 각각 찾음
  for (let i = 0; i < poses.length; i++) {
    const keypoints = poses[i].keypoints;
    if (keypoints[5].score > 0.3 && keypoints[11].score > 0.3 && keypoints[13].score > 0.3) {
      leftShoulder = keypoints[5];
      leftHip = keypoints[11];
      leftKnee = keypoints[13];
    }
    if (keypoints[6].score > 0.3 && keypoints[12].score > 0.3 && keypoints[14].score > 0.3) {
      rightShoulder = keypoints[6];
      rightHip = keypoints[12];
      rightKnee = keypoints[14];
    }
  }

  if (leftKnee && leftHip && leftShoulder) {
    const angle = (
      Math.atan2(
      leftKnee.y - leftHip.y,
      leftKnee.x - leftHip.x
    ) - Math.atan2(
      leftShoulder.y - leftHip.y,
      leftShoulder.x - leftHip.x
    )
    ) * (180 / Math.PI);
    backAngle = angle % 180;
  }

   if (rightKnee && rightHip && rightShoulder) {
    const angle = (
      Math.atan2(
      rightKnee.y - rightHip.y,
      rightKnee.x - rightHip.x
    ) - Math.atan2(
      rightShoulder.y - rightHip.y,
      rightShoulder.x - rightHip.x
    )
    ) * (180 / Math.PI);
    backAngle = angle % 180;
  }

if ((backAngle < 30) || (backAngle > 120)) {
    highlightBack = false;
  }
  else {
    highlightBack = true;
    if (backWarningGiven != true) {
      var msg = new SpeechSynthesisUtterance('등을 피세요');
      msg.rate = 0.8
      window.speechSynthesis.speak(msg);      
      backWarningGiven = true;
    }
  }
} 

function updateLegAngle(){
  let leftKnee, leftAnkle;
  let rightKnee, rightAnkle;
  // 신뢰도가 일정 수준 이상인 왼쪽등과 오른쪽등 정보를 각각 찾음
  for (let i = 0; i < poses.length; i++) {
    const keypoints = poses[i].keypoints;
    if (keypoints[15].score > 0.3 && keypoints[13].score > 0.3) {
      leftKnee = keypoints[13];
      leftAnkle = keypoints[15];
    }
    if (keypoints[16].score > 0.3 && keypoints[14].score > 0.3) {
      rightKnee = keypoints[14];
      rightAnkle = keypoints[16];
    }
  }
  if (leftKnee && leftAnkle) {
    const angle = (
      Math.atan2(
      leftAnkle.y - leftKnee.y,
      leftAnkle.x - leftKnee.x 
      ) 
    ) * (180 / Math.PI);
    legAngle = angle % 180;
  }
  if (rightKnee && rightAnkle) {
    const angle = (
      Math.atan2(
        rightAnkle.y - rightKnee.y,
        rightAnkle.x - rightKnee.x 
      ) 
    ) * (180 / Math.PI);
    legAngle = angle % 180;
  }
  if ((legAngle < 180) || (legAngle > 160)) {
    highlightLeg = true;
  }
}

function inUpPosition() {

  if (elbowAngle >= 85 && elbowAngle <= 95 && backAngle>=170 && backAngle<=190 && highlightLeg) {
      feedback = 'Excellent';
      var msg = new SpeechSynthesisUtterance('좋은 자세입니다! 계속 유지해주세요');
      msg.rate = 0.6;
      window.speechSynthesis.speak(msg);
      timer+= 1;
      upPosition = true;
    }
  else if (elbowAngle > 80 && elbowAngle < 100  && backAngle>=170 && backAngle<=190 && highlightLeg) {
      feedback = 'Best';
      var msg = new SpeechSynthesisUtterance('팔을 조금 더 세워 주세요');
      msg.rate = 0.6;
      window.speechSynthesis.speak(msg);
      timer += 1;
     upPosition = true;
    }  
  else if (elbowAngle > 75 && elbowAngle < 120  && backAngle>=170 && backAngle<=190 && highlightLeg) {
      feedback = 'Good';
      var msg = new SpeechSynthesisUtterance('팔을 더 직각으로 만들어주세요 ');
      msg.rate = 0.6;
      window.speechSynthesis.speak(msg);
      timer += 1;
      upPosition = true;
    } 
    else if (elbowAngle > 75 && elbowAngle < 120  && backAngle>=170 && backAngle<=190 && highlightLeg) {
      feedback = 'Bad';
      var msg = new SpeechSynthesisUtterance('자세를 다시 잡아주세요');
      msg.rate = 0.6;
      window.speechSynthesis.speak(msg);
      upPosition = true;
    }
}

function inDownPosition() {
var elbowAboveNose = false;
  if ((highlightBack == false) && elbowAboveNose && !highlightLeg && ((abs(elbowAngle) > 60) && (abs(elbowAngle) < 120))) {
    downPosition = true;
    upPosition = false;
  }
}

