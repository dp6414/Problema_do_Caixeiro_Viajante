
let nodes = [];
let edges = new Map();
let selectedNode = null;
let selectedEdge = null;

function setup() {
  let canvas = createCanvas(1000, 800);
  canvas.parent('canvas-container'); 
  noLoop(); 
}

function draw() {
    background(240);
    strokeWeight(4);

    for (let [key,value] of edges) {
      let node1 = key.split(",")
      for(let no of value){
        let node2 = no[0] 
        line(node1[0], node1[1], node2[0], node2[1]);
      }
    }
    
    for (let node of nodes) {
        fill(node == selectedNode ? 'red' : 'black'); 
        ellipse(node.x, node.y, 25, 25);
    }
}

function mousePressed() {
  if(mouseX<=0 || mouseX>width ||mouseY<=0 || mouseY> height){
    return;
  }

  let clickedNode = getClickedNode(mouseX, mouseY);


  if (clickedNode) {
    if (selectedNode == null) {
      selectedNode = clickedNode;
      let chave = selectedNode.x.toString()+","+selectedNode.y.toString();
    } else if (selectedNode != clickedNode && ) {
      if(edges.has(chave)){
        edges.get(chave).push()///continuar aqui
      }
      edges.set(, );
      selectedNode = null;
      updateEdgeCount();
    }
  } else {
    let clickedEdge = getClickedEdge(mouseX,mouseY);
    if(clickedEdge != null){
      edges = edges.filter(edge => edge != clickedEdge);
    }
    else{
      nodes.push({ x: mouseX, y: mouseY });
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
  for (let edge of edges){
    if (belongsToEdge(edge.a,edge.b,x,y)) r = edge;
  }
  console.log(r);
  return r;
}


function clearGraph() {
    nodes.length = 0;
    edges.length = 0;
    selectedNode = null;
    selectedEdge = null;
    updateVertexCount(); 
    updateEdgeCount();
    redraw();
  }





function updateVertexCount() {
    document.getElementById('vertex-count').innerText = `Número de Vértices: ${nodes.length}`;
  }

function updateEdgeCount(){
    document.getElementById('edge-count').innerText = `Número de Arestas: ${edges.length}`;
}


function edgeRemove(){
  let edgeToRemove = getClickedNode(x,y)

  if (edgeToRemove) {
    edges = edges.filter(edge => edge !== edgeToRemove);
    updateEdgeCount();

    redraw();
  }
}


function nodeRemove(){
  if(selectedNode){
    edges = edges.filter(edge => edge.a != selectedNode && edge.b != selectedNode);

    updateEdgeCount();

    nodes = nodes.filter(node => node != selectedNode);

    updateVertexCount();

    redraw();
    selectedNode = null
  }
  
}

window.onload = function() {
  document.getElementById('clear-btn').addEventListener('click', clearGraph);
  document.getElementById('clearVertex-btn').addEventListener('click', nodeRemove);
  document.getElementById('clearNode-btn').addEventListener('click', edgeRemove);
}