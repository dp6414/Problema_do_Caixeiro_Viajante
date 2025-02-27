
let nodes = [];
let nodeCount = 1;
let edges = new Map();
let selectedNode = null;
let selectedEdge = null;
let edgcount = 0;
var popup;
let clicky = true; 
let peso = 0;
let ctx = null;
let activePopup = false;
let tempEdge = null;


function setup() {
  let canvas = createCanvas(1000, 800);
  canvas.parent('canvas-container'); 
  noLoop(); 
}

function draw() {
  if(!activePopup){
    background(240);
    strokeWeight(4);
    textSize(13);
    fill(0);
    textAlign(CENTER,CENTER);


    for (let [node1,value] of edges) {
      for(let no of value){
        let node2 = no[0];
        let peso = no[1];
        mx = (node1.x + node2.x) / 2;
        my = (node1.y + node2.y) / 2;
        line(node1.x, node1.y, node2.x, node2.y);
        text(peso, mx-10, my-10);
      }
    }
    
    for (let node of nodes) {
        fill(node == selectedNode ? 'red' : 'black'); 
        ellipse(node.x, node.y, 25, 25);

        fill('white');
            textSize(14);
            text(node.name, node.x, node.y);
    }
  }
}

function mousePressed() {
  if(mouseX<=0 || mouseX>width ||mouseY<=0 || mouseY> height || !clicky){
    return;
  }

  let clickedNode = getClickedNode(mouseX, mouseY);


  if (clickedNode) {
    noLoop();
    if (selectedNode == null) {
      selectedNode = clickedNode;
    } else if (selectedNode != clickedNode){
      if (!edges.has(selectedNode)) {
        edges.set(selectedNode, []);
    }
    
    if (!edges.get(selectedNode).some(no => no[0] == clickedNode)) {
        tempEdge = { from: selectedNode, to: clickedNode };
        showPopup(); 
    }
      selectedNode = null;
      updateEdgeCount();
    }
  } else {
    let clickedEdge = getClickedEdge(mouseX,mouseY);
    if(clickedEdge != null){
      edges.set(clickedEdge[0],edges.get(clickedEdge[0]).filter(edge => edge != clickedEdge[1]));
      edgcount--;
    }
    else{
      let nodeName = String.fromCharCode(64 + nodeCount);
      nodes.push({ x: mouseX, y: mouseY, name: nodeName});
      nodeCount ++;
      selectedNode = null;
      updateVertexCount(); 
    }
  }
  
  loop();
}

function belongsToEdge(node1,node2,x,y){
  let m = (node2.y - node1.y) / (node2.x - node1.x); 
  let b = node1.y - m * node1.x;

  for(let xs = x-10; xs<x+10; xs++){
    for(let ys = y-10; ys<y+10; ys++){
      if (Math.floor(xs * m + b) == Math.floor(ys)) return true;
    }
  }
  return false;
}


function getClickedNode(x, y) {
  let r = null;
  for (let node of nodes) {
    let d = dist(x, y, node.x, node.y);
    if (d < 20) r = node;
  }
  return r;
}

function getClickedEdge(x,y){
  let r = null;
  for (let [node1,nos] of edges){
    for(let no of nos){
      let node2 = no[0]
      if (belongsToEdge(node1,node2,x,y)) r = [node1,no];
    }
  }
  console.log(r);
  return r;
}


function clearGraph() {
    nodes.length = 0;
    edges = new Map()
    edgcount = 0
    selectedNode = null;
    selectedEdge = null;
    nodeCount = 1;
    updateVertexCount(); 
    updateEdgeCount();
    redraw();
  }


function updateVertexCount() {
    document.getElementById('vertex-count').innerText = `Número de Vértices: ${nodes.length}`;
  }

function updateEdgeCount(){
    document.getElementById('edge-count').innerText = `Número de Arestas: ${edgcount}`;
}


function nodeRemove(){
  if(selectedNode){
    edges.delete(selectedNode)
    for([node1, no] of edges){
      edges.set(node1,no.filter(n => n[0] != selectedNode))
    }
    updateEdgeCount();

    nodes = nodes.filter(node => node != selectedNode);

    updateVertexCount();
    nodeCount --;

    redraw();
    selectedNode = null
  }
  
}

function inputPeso() {
  const input = document.getElementById('inputPeso');
  let peso = parseInt(input.value); 

  if (!isNaN(peso)) {
      edges.get(tempEdge.from).push([tempEdge.to, peso]);
      edgcount++;
      updateEdgeCount();
  }

  tempEdge = null; 
  hidePopup();
  redraw();
}


window.onload = function() {
  document.getElementById('clear-btn').addEventListener('click', clearGraph);
  document.getElementById('clearVertex-btn').addEventListener('click', nodeRemove);
  document.getElementById('inAresta').addEventListener('click', inputPeso);
  popup = document.getElementById("popup");
}

function showPopup() {
    popup.style.display = "flex";
    clicky = false;
    activePopup = true;
    
}

// Function to hide the popup
function hidePopup() {
    popup.style.display = "none";
    clicky = true;
    activePopup=false;
}

window.addEventListener("click", function (event) {
  if (event.target === popup) {
      hidePopup();
  }
});
