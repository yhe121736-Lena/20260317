let inputElement, sliderElement, selectEffectElement, selectSiteElement, btnShowElement, btnSendElement, iframeDiv;
let colors = "ffbe0b-fb5607-ff006e-8338ec-3a86ff".split("-").map(tx => "#" + tx);
let stars = []; 
let jellyParticles = []; 
let isShow = true; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  for (let i = 0; i < 200; i++) {
    stars.push({ x: random(width), y: random(height), s: random(1, 3), t: random(100) });
  }

  // --- UI 控制區域 ---
  btnShowElement = createButton("👁 網頁開關");
  btnShowElement.position(20, 20); 
  btnShowElement.mousePressed(toggleIframe);
  styleNeonBtn(btnShowElement, '#00f2ff');

  btnSendElement = createButton("🚀 噴發果凍字");
  btnSendElement.position(150, 20);
  btnSendElement.mousePressed(spawnJelly);
  styleNeonBtn(btnSendElement, '#ffbe0b');

  inputElement = createInput("彈跳果凍");
  inputElement.position(300, 20);
  inputElement.size(100, 30);
  styleInput(inputElement);

  sliderElement = createSlider(15, 80, 30);
  sliderElement.position(430, 28);

  selectEffectElement = createSelect();
  selectEffectElement.position(580, 25);
  selectEffectElement.option('波浪跳動', 'dance');
  selectEffectElement.option('霓虹閃爍', 'blink');
  selectEffectElement.option('文字縮放', 'zoom');
  selectEffectElement.option('色票旋轉', 'colorRotate');
  styleInput(selectEffectElement);

  selectSiteElement = createSelect();
  selectSiteElement.position(700, 25);
  selectSiteElement.option('淡江教科系', 'https://www.et.tku.edu.tw');
  selectSiteElement.option('淡江大學', 'https://www.tku.edu.tw');
  selectSiteElement.changed(updateAll);
  styleInput(selectSiteElement);

  iframeDiv = createDiv('');
  iframeDiv.position(150, 150);
  iframeDiv.size(windowWidth - 300, windowHeight - 300);
  iframeDiv.style('background', 'rgba(0,0,0,0.9)');
  iframeDiv.style('border', '2px solid #00f2ff');
  iframeDiv.style('border-radius', '15px');
  iframeDiv.style('overflow', 'hidden');

  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('width', '100%');
  iframe.style('height', '100%');
  iframe.parent(iframeDiv);
}

function draw() {
  background(5, 5, 20); 

  noStroke();
  for (let s of stars) {
    let blink = map(sin(frameCount * 0.05 + s.t), -1, 1, 50, 255);
    fill(255, blink);
    circle(s.x, s.y, s.s);
  }

  let txt = inputElement.value(); 
  let tSize = sliderElement.value();
  let effect = selectEffectElement.value();
  textSize(tSize);
  
  for (let y = 100; y < height + tSize; y += 70 + tSize) {
    let x = 0;
    let colorIndex = 0;
    while (x < width + textWidth(txt)) {
      let col = color(colors[colorIndex % colors.length]);
      let dx = 0, dy = 0, curSize = tSize;
      
      if (effect === 'dance') {
        dx = sin(frameCount * 0.1 + x * 0.02) * 20;
        dy = cos(frameCount * 0.1 + y * 0.02) * 20;
      } else if (effect === 'blink') {
        col.setAlpha(map(sin(frameCount * 0.15 + x), -1, 1, 50, 255));
      } else if (effect === 'zoom') {
        curSize = tSize + sin(frameCount * 0.1 + x * 0.05) * (tSize/2);
      } else if (effect === 'colorRotate') {
        col = color(colors[(colorIndex + floor(frameCount/25)) % colors.length]);
      }

      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = col;
      fill(col);
      textSize(curSize);
      text(txt, x + dx, y + dy);
      x += textWidth(txt) + 40;
      colorIndex++;
    }
  }

  // 繪製與更新果凍粒子
  for (let i = jellyParticles.length - 1; i >= 0; i--) {
    let p = jellyParticles[i];
    p.update();
    p.display();
    if (p.y > height + 200) {
      jellyParticles.splice(i, 1);
    }
  }
}

function spawnJelly() {
  let newJelly = new JellyText(inputElement.value(), random(width * 0.1, width * 0.9), 50);
  jellyParticles.push(newJelly);
}

// 修正後的果凍彈跳類別
class JellyText {
  constructor(t, x, y) {
    this.text = t;
    this.x = x;
    this.y = y;
    this.velY = 0;
    this.velX = random(-3, 3);
    this.gravity = 0.6;
    this.bounce = -0.7; // 彈力係數（反向並減少動能）
    this.bounceCount = 0;
    this.maxBounces = 3; // 碰到底部彈 3 下
    this.size = sliderElement.value() * 1.5;
    this.color = color(random(colors));
    this.timer = 0;
  }

  update() {
    this.velY += this.gravity;
    this.y += this.velY;
    this.x += this.velX;
    this.timer += 0.3;

    // 地板偵測
    let ground = height - 50;
    if (this.y > ground && this.bounceCount < this.maxBounces) {
      this.y = ground;
      this.velY *= this.bounce; // 向上彈
      this.bounceCount++;
      
      // 碰到地板時產生擠壓感
      this.timer = PI; 
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    
    // 果凍變形邏輯
    let squash = 1 + sin(this.timer) * 0.25;
    let stretch = 1 - sin(this.timer) * 0.25;
    scale(squash, stretch);
    
    textAlign(CENTER, BOTTOM); // 以底部為基準點彈跳
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = this.color;
    fill(this.color);
    textSize(this.size);
    text(this.text, 0, 0);
    pop();
  }
}

function toggleIframe() {
  isShow = !isShow;
  if (isShow) {
    iframeDiv.show();
    btnShowElement.html("👁 網頁顯示中");
    styleNeonBtn(btnShowElement, '#00f2ff');
  } else {
    iframeDiv.hide();
    btnShowElement.html("✨ 網頁已隱藏");
    styleNeonBtn(btnShowElement, '#ff0077');
  }
}

function updateAll() {
  let label = selectSiteElement.elt.options[selectSiteElement.elt.selectedIndex].text;
  let url = selectSiteElement.value();
  inputElement.value(label);
  let iframe = select('iframe');
  iframe.attribute('src', url);
}

function styleNeonBtn(el, col) {
  el.style('background', 'rgba(0,0,0,0.6)');
  el.style('color', col);
  el.style('border', '2px solid ' + col);
  el.style('border-radius', '20px');
  el.style('padding', '8px 15px');
  el.style('font-weight', 'bold');
  el.style('box-shadow', '0 0 15px ' + col);
  el.style('cursor', 'pointer');
}

function styleInput(el) {
  el.style('background', '#1a1a2e');
  el.style('color', '#fff');
  el.style('border', '1px solid #00f2ff');
  el.style('border-radius', '5px');
  el.style('padding', '5px');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}