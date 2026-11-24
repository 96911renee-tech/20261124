let bgImage; // 儲存背景圖片 bg/3.png
let bgOffsetX = 0; // 記錄背景水平捲動偏移量（負值代表背景往左移動）[cite: 3]
let characterSprite; // 儲存角色一的精靈圖[cite: 3]
let walkSprite; // 儲存角色一的走路精靈圖[cite: 3]
let magicSprite; // 儲存角色一的施法精靈圖[cite: 3]
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖[cite: 3]
let characterX; // 儲存角色一目前的水平中心位置[cite: 3]
let isWalking = false; // 記錄角色是否已切換為走路動畫[cite: 3]
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）[cite: 3]
let isCasting = false; // 記錄角色是否正在播放施法動畫[cite: 3]
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數[cite: 3]
let magicDirection = 1; // 記錄施法時鎖定的方向[cite: 3]
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發[cite: 3]
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效[cite: 3]

// 第二角色相關變數
let char2StopSprite; // 儲存角色二的站立精靈圖（2/stop/stop.png）
let char2ActionSprite; // 儲存角色二的動作精靈圖（2/action/action.png）

// 選擇題狀態與題目資料
const quizQuestion = {
  question: "在 p5.js 中，哪一個函式會在程式開始時執行一次，用來建立畫布？",
  options: [
    "A. draw()",
    "B. setup()",
    "C. preload()"
  ],
  answerIndex: 1 // 正確答案為 B（索引 1）
};
let selectedOption = null; // 記錄玩家選擇的選項索引
let wasChar2Active = false; // 記錄上一幀是否處於靠近角色二的狀態
let optionHitBoxes = []; // 儲存每個選項的點擊區域座標

const frameCountInSprite = 10; // 設定精靈圖包含的影格數[cite: 3]
const frameWidth = 139.5; // 設定每個影格的寬度（1395 除以 10）[cite: 3]
const frameHeight = 196; // 設定每個影格的高度[cite: 3]
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數[cite: 3]
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度[cite: 3]
const walkFrameHeight = 198; // 設定走路動畫每格的高度[cite: 3]
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數[cite: 3]
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度[cite: 3]
const magicFrameHeight = 146; // 設定施法動畫每格的高度[cite: 3]
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數[cite: 3]
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度[cite: 3]
const effectFrameHeight = 19; // 設定魔法特效每格的高度[cite: 3]
const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格[cite: 3]

// 第二角色精靈圖參數
const char2StopFrameCount = 8; // 角色二站立影格數
const char2StopFrameWidth = 699 / char2StopFrameCount; // 角色二站立單格寬度
const char2StopFrameHeight = 190; // 角色二站立單格高度

const char2ActionFrameCount = 12; // 角色二動作影格數
const char2ActionFrameWidth = 1583 / char2ActionFrameCount; // 角色二動作單格寬度
const char2ActionFrameHeight = 171; // 角色二動作單格高度

function preload() { // 在畫布建立前載入圖片資源[cite: 3]
  bgImage = loadImage("bg/3.png"); // 載入背景圖片 bg/3.png[cite: 3]
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖[cite: 3]
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖[cite: 3]
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖[cite: 3]
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖[cite: 3]

  char2StopSprite = loadImage("2/stop/stop.png"); // 載入角色二的八格站立精靈圖
  char2ActionSprite = loadImage("2/action/action.png"); // 載入角色二的十二格動作精靈圖
} // 結束圖片載入函式[cite: 3]

function setup() { // 初始化畫布與繪圖模式[cite: 3]
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布[cite: 3]
  imageMode(CENTER); // 讓座標代表影格的中心點[cite: 3]
  characterX = (width * 2) / 3; // 將角色初始位置設在畫布寬度的三分之二處[cite: 3]
  frameRate(60); // 將動畫更新速率設定為每秒六十格[cite: 3]
} // 結束初始化函式[cite: 3]

function draw() { // 每個畫面更新一次背景與角色[cite: 3]
  background("#87CEEB"); // 預設底色避免圖片載入前空白[cite: 3]
  optionHitBoxes = []; // 每次繪製前重設選項點擊區域

  // 計算單張背景圖片依畫布高度等比例縮放後的寬度（確保至少與畫布同寬以完整覆蓋畫面）[cite: 3]
  const bgAspect = bgImage && bgImage.height > 0 ? bgImage.width / bgImage.height : 1; //[cite: 3]
  const singleBgWidth = max(width, height * bgAspect); //[cite: 3]
  const singleBgHeight = height; //[cite: 3]

  // 計算三張背景串接後的可捲動範圍[cite: 3]
  const minBgOffset = width - singleBgWidth * 2; //[cite: 3]
  const maxBgOffset = singleBgWidth; //[cite: 3]
  const anchorX = (width * 2) / 3; // 角色在捲動模式下的基準水平位置[cite: 3]

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住[cite: 3]
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住[cite: 3]
  isWalking = movingRight || movingLeft; // 沒有按住左右鍵時切回站立動畫[cite: 3]
  const movementStep = constrain(width * 0.004, 2, 8); // 依畫布寬度計算適合不同裝置的移動速度[cite: 3]

  // 維持角色高度為畫布高度的 1/3，寬度依原圖寬高比等比例縮放[cite: 3]
  const characterScale = (height / 3) / frameHeight; //[cite: 3]
  const characterWidth = frameWidth * characterScale; // 計算角色基本顯示寬度[cite: 3]
  const characterHeight = height / 3; //[cite: 3]

  if (movingRight) { // 按住右方向鍵[cite: 3]
    isWalking = true; // 切換至走路動畫[cite: 3]
    facingDirection = 1; // 設定角色朝向右方[cite: 3]
    if (characterX < anchorX) { //[cite: 3]
      // 若角色先前因碰到最左邊界而往左移動，先讓角色走回基準點再捲動背景[cite: 3]
      characterX = min(anchorX, characterX + movementStep); //[cite: 3]
    } else if (bgOffsetX > minBgOffset) { //[cite: 3]
      // 背景尚未到達最右邊，背景往左移動[cite: 3]
      bgOffsetX = max(minBgOffset, bgOffsetX - movementStep); //[cite: 3]
    } else { //[cite: 3]
      // 背景已到達最右邊，暫停背景捲動並改為角色向右移動[cite: 3]
      characterX += movementStep; // 讓角色向右移動[cite: 3]
    } //[cite: 3]
  } else if (movingLeft) { // 按住左方向鍵[cite: 3]
    isWalking = true; // 切換至走路動畫[cite: 3]
    facingDirection = -1; // 設定角色朝向左方[cite: 3]
    if (characterX > anchorX) { //[cite: 3]
      // 若角色先前因碰到最右邊界而往右移動，先讓角色走回基準點再捲動背景[cite: 3]
      characterX = max(anchorX, characterX - movementStep); //[cite: 3]
    } else if (bgOffsetX < maxBgOffset) { //[cite: 3]
      // 背景尚未到達最左邊，背景往右移動[cite: 3]
      bgOffsetX = min(maxBgOffset, bgOffsetX + movementStep); //[cite: 3]
    } else { //[cite: 3]
      // 背景已到達最左邊，暫停背景捲動並改為角色向左移動[cite: 3]
      characterX -= movementStep; // 讓角色向左移動[cite: 3]
    } //[cite: 3]
  } //[cite: 3]

  // 限制角色中心避免超出畫布左右邊界[cite: 3]
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2); // 限制角色中心避免超出畫布左右邊界[cite: 3]

  // 繪製三張左右串接的背景圖片（左：i = -1，中：i = 0，右：i = 1）[cite: 3]
  if (bgImage) { //[cite: 3]
    push(); //[cite: 3]
    imageMode(CORNER); // 背景使用左上角座標對齊無縫串接[cite: 3]
    for (let i = -1; i <= 1; i++) { //[cite: 3]
      const drawX = bgOffsetX + i * singleBgWidth; //[cite: 3]
      image(bgImage, drawX, 0, singleBgWidth, singleBgHeight); //[cite: 3]
    } //[cite: 3]
    pop(); //[cite: 3]
  } //[cite: 3]

  // 計算第二角色的位置（顯示在最左邊背景圖 i = -1 的正中央）
  const leftBgX = bgOffsetX - singleBgWidth;
  const char2X = leftBgX + singleBgWidth / 2;

  // 依角色高度比例計算第二角色的縮放倍率（以站立高度 190 為基準對應畫布高度的 1/3）
  const char2Scale = (height / 3) / char2StopFrameHeight;
  const char2CurrentStopWidth = char2StopFrameWidth * char2Scale;
  const char2CurrentActionWidth = char2ActionFrameWidth * char2Scale;

  // 判斷角色一是否接近角色二
  const distanceToChar2 = abs(characterX - char2X);
  const triggerDistance = characterWidth * 0.5 + max(char2CurrentStopWidth, char2CurrentActionWidth) * 0.6;
  const isChar2Active = distanceToChar2 <= triggerDistance;

  // 當離開角色二感應範圍時重設作答狀態，下次靠近重新出題
  if (!isChar2Active && wasChar2Active) {
    selectedOption = null;
  }
  wasChar2Active = isChar2Active;

  // 繪製第二角色
  if (char2StopSprite && char2ActionSprite) {
    const c2Sprite = isChar2Active ? char2ActionSprite : char2StopSprite;
    const c2FrameCount = isChar2Active ? char2ActionFrameCount : char2StopFrameCount;
    const c2FrameW = isChar2Active ? char2ActionFrameWidth : char2StopFrameWidth;
    const c2FrameH = isChar2Active ? char2ActionFrameHeight : char2StopFrameHeight;
    const c2FrameIndex = floor(frameCount / framesPerStep) % c2FrameCount;
    const c2SourceX = c2FrameIndex * c2FrameW;
    const c2DrawW = c2FrameW * char2Scale;
    const c2DrawH = c2FrameH * char2Scale;
    const char2Y = height - c2DrawH / 2;

    push();
    translate(char2X, char2Y);
    // 若角色一在角色二右側，讓角色二朝右看；若在左側則朝左看
    const char2Facing = characterX >= char2X ? 1 : -1;
    scale(char2Facing, 1);
    image(c2Sprite, 0, 0, c2DrawW, c2DrawH, c2SourceX, 0, c2FrameW, c2FrameH);
    pop();
  }

  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) { // 檢查施法動畫是否已完整播放一次[cite: 3]
    isCasting = false; // 結束施法動畫並恢復一般角色動作[cite: 3]
    activeEffects.push({ x: characterX + magicDirection * characterWidth / 2, y: height - characterHeight * 0.58, direction: magicDirection }); // 在角色前方建立朝施法方向飛行的特效[cite: 3]
  } // 結束施法動畫完成判斷[cite: 3]

  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite; // 根據角色狀態選擇施法、走路或站立精靈圖[cite: 3]
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite; // 取得目前精靈圖的影格總數[cite: 3]
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth; // 取得目前精靈圖每格的寬度[cite: 3]
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight; // 取得目前精靈圖每格的高度[cite: 3]
  const elapsedMagicFrames = frameCount - magicStartFrame; // 計算施法動畫已播放的畫面數[cite: 3]
  const frameIndex = isCasting ? floor(elapsedMagicFrames / framesPerStep) : floor(frameCount / framesPerStep) % activeFrameCount; // 計算目前要顯示的精靈影格[cite: 3]
  const sourceX = frameIndex * activeFrameWidth; // 計算目前影格在精靈圖中的水平起點[cite: 3]
  const activeWidth = activeFrameWidth * characterScale; // 計算目前角色影格的顯示寬度[cite: 3]
  const activeHeight = activeFrameHeight * characterScale; // 計算目前角色影格的顯示高度[cite: 3]
  const characterY = height - activeHeight / 2; // 將目前角色影格底部對齊畫布底部[cite: 3]

  push(); // 暫存目前的繪圖座標轉換狀態[cite: 3]
  translate(characterX, characterY); // 將繪圖原點移至角色中心[cite: 3]
  scale(isCasting ? magicDirection : facingDirection, 1); // 依施法或角色朝向決定是否水平翻轉[cite: 3]
  image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight); // 裁切並繪製目前角色影格[cite: 3]
  pop(); // 還原繪圖座標轉換狀態[cite: 3]

  const effectScale = characterScale; // 使用角色縮放倍率讓特效適應不同畫布[cite: 3]
  const effectWidth = effectFrameWidth * effectScale; // 計算特效影格的顯示寬度[cite: 3]
  const effectHeight = effectFrameHeight * effectScale; // 計算特效影格的顯示高度[cite: 3]
  const effectSpeed = max(6, width * 0.008); // 依畫布寬度計算特效飛行速度[cite: 3]
  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) { // 由後往前更新所有飛行中的特效[cite: 3]
    const effect = activeEffects[effectIndex]; // 取得目前更新的特效資料[cite: 3]
    effect.x += effect.direction * effectSpeed; // 依特效方向更新水平位置[cite: 3]
    if (effect.x > width || effect.x < 0) { // 判斷特效是否已抵達畫布左右邊緣[cite: 3]
      activeEffects.splice(effectIndex, 1); // 移除已飛出畫布的特效[cite: 3]
      continue; // 略過已移除特效的繪製[cite: 3]
    } // 結束特效邊界判斷[cite: 3]
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount; // 計算特效目前播放的影格[cite: 3]
    push(); // 暫存目前的繪圖座標轉換狀態[cite: 3]
    translate(effect.x, effect.y); // 將繪圖原點移至特效中心[cite: 3]
    scale(effect.direction, 1); // 依飛行方向翻轉特效影格[cite: 3]
    image(magicEffectSprite, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight); // 裁切並繪製目前特效影格[cite: 3]
    pop(); // 還原繪圖座標轉換狀態[cite: 3]
  } // 結束飛行中特效更新迴圈[cite: 3]

  // 當角色一接近角色二時，在畫布上方顯示透明度 90 的黃色選擇題方框
  if (isChar2Active) {
    drawQuizBox();
  }
} // 結束繪圖函式[cite: 3]

function drawQuizBox() {
  const boxW = width / 3; // 方框寬為整個畫布寬的 1/3
  const boxH = height / 2; // 方框高為整個畫布高的 1/2
  const boxX = width / 2 - boxW / 2; // 方框中間對準畫布中間
  const boxY = height * 0.02; // 靠近畫布上方

  push();
  // 繪製透明度為 90 的黃色方框
  fill(255, 230, 60, 90);
  stroke(160, 120, 0, 180);
  strokeWeight(2);
  rect(boxX, boxY, boxW, boxH, 12);

  // 繪製題目與選項文字（使用較高不透明度確保可讀性）
  const padding = min(boxW, boxH) * 0.06;
  const contentX = boxX + padding;
  const contentW = boxW - padding * 2;
  const titleSize = constrain(boxH * 0.065, 14, 24);
  const optionSize = constrain(boxH * 0.055, 12, 20);

  noStroke();
  fill(35, 30, 10, 235);
  textAlign(LEFT, TOP);
  textSize(titleSize);
  const questionAreaH = boxH * 0.34;
  text(quizQuestion.question, contentX, boxY + padding, contentW, questionAreaH);

  // 繪製三個選項按鈕區域
  const optionStartY = boxY + padding + questionAreaH + boxH * 0.03;
  const availableOptionH = boxH - (optionStartY - boxY) - padding - boxH * 0.12;
  const optionGap = availableOptionH * 0.08;
  const optionBtnH = (availableOptionH - optionGap * (quizQuestion.options.length - 1)) / quizQuestion.options.length;

  for (let i = 0; i < quizQuestion.options.length; i++) {
    const optY = optionStartY + i * (optionBtnH + optionGap);
    optionHitBoxes.push({ index: i, x: contentX, y: optY, w: contentW, h: optionBtnH });

    const isHover = mouseX >= contentX && mouseX <= contentX + contentW && mouseY >= optY && mouseY <= optY + optionBtnH;
    const isSelected = selectedOption === i;

    if (isSelected) {
      if (i === quizQuestion.answerIndex) {
        fill(80, 200, 120, 170); // 答對顯示綠色提示
      } else {
        fill(235, 95, 95, 170); // 答錯顯示紅色提示
      }
    } else if (isHover) {
      fill(255, 255, 255, 160);
    } else {
      fill(255, 255, 255, 115);
    }

    stroke(140, 110, 20, 160);
    strokeWeight(1.5);
    rect(contentX, optY, contentW, optionBtnH, 8);

    noStroke();
    fill(25, 25, 25, 240);
    textAlign(LEFT, CENTER);
    textSize(optionSize);
    text(quizQuestion.options[i], contentX + 12, optY + optionBtnH / 2);
  }

  // 顯示作答結果提示
  if (selectedOption !== null) {
    const feedbackY = boxY + boxH - padding - boxH * 0.06;
    textAlign(CENTER, CENTER);
    textSize(optionSize);
    if (selectedOption === quizQuestion.answerIndex) {
      fill(20, 110, 50, 245);
      text("答對了！很棒！", boxX + boxW / 2, feedbackY);
    } else {
      fill(165, 30, 30, 245);
      text("再試試看，提示：初始化函式是 B", boxX + boxW / 2, feedbackY);
    }
  }

  pop();
}

function mousePressed() {
  if (!wasChar2Active || optionHitBoxes.length === 0) return;
  for (const box of optionHitBoxes) {
    if (mouseX >= box.x && mouseX <= box.x + box.w && mouseY >= box.y && mouseY <= box.y + box.h) {
      selectedOption = box.index;
      break;
    }
  }
}

function keyPressed() { // 按下方向鍵時切換角色狀態與朝向[cite: 3]
  if (keyCode === RIGHT_ARROW) { // 判斷是否按下右方向鍵[cite: 3]
    isWalking = true; // 啟用走路動畫[cite: 3]
    facingDirection = 1; // 讓角色面向右方[cite: 3]
    return false; // 防止方向鍵捲動網頁[cite: 3]
  } // 結束右方向鍵判斷[cite: 3]
  if (keyCode === LEFT_ARROW) { // 判斷是否按下左方向鍵[cite: 3]
    isWalking = true; // 啟用走路動畫[cite: 3]
    facingDirection = -1; // 讓角色面向左方[cite: 3]
    return false; // 防止方向鍵捲動網頁[cite: 3]
  } // 結束左方向鍵判斷[cite: 3]
  if (keyCode === 32) { // 判斷是否按下空白鍵[cite: 3]
    if (!spaceIsDown && !isCasting) { // 僅在空白鍵新按下且角色未施法時觸發[cite: 3]
      isCasting = true; // 開始播放施法動畫[cite: 3]
      magicStartFrame = frameCount; // 記錄施法動畫的起始畫面[cite: 3]
      magicDirection = facingDirection; // 鎖定施法當下角色面向[cite: 3]
    } // 結束施法啟動判斷[cite: 3]
    spaceIsDown = true; // 記錄空白鍵已按住以避免連續觸發[cite: 3]
    return false; // 防止空白鍵捲動網頁[cite: 3]
  } // 結束空白鍵判斷[cite: 3]

  // 若選擇題方框正在顯示，也可用數字鍵 1、2、3 快速作答
  if (wasChar2Active) {
    if (key === "1") selectedOption = 0;
    else if (key === "2") selectedOption = 1;
    else if (key === "3") selectedOption = 2;
  }
} // 結束按鍵事件處理函式[cite: 3]

function keyReleased() { // 鍵盤按鍵放開時更新按鍵狀態[cite: 3]
  if (keyCode === 32) { // 判斷放開的是否為空白鍵[cite: 3]
    spaceIsDown = false; // 允許下次按空白鍵重新施法[cite: 3]
  } // 結束空白鍵放開判斷[cite: 3]
} // 結束按鍵放開事件處理函式[cite: 3]

function windowResized() { // 視窗尺寸改變時重新調整畫布[cite: 3]
  resizeCanvas(windowWidth, windowHeight); // 將畫布同步為新的視窗尺寸[cite: 3]
  characterX = constrain(characterX, 1, width - 1); // 將角色位置限制在縮放後畫布內[cite: 3]
} // 結束視窗縮放處理函式[cite: 3]