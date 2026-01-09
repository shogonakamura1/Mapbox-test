// Mapbox アクセストークン
// ローカルストレージに保存されたトークンを使用、なければ環境変数またはデフォルト値
let mapboxAccessToken = localStorage.getItem('mapboxToken') || '';

// 九州大学伊都キャンパス周辺の飛行ルートポイント
const flightRoute = [
    { lng: 130.2100, lat: 33.6000, zoom: 15, name: 'キャンパス北側' },
    { lng: 130.2163, lat: 33.5946, zoom: 16, name: 'キャンパス中央' },
    { lng: 130.2220, lat: 33.5900, zoom: 15, name: 'キャンパス南側' },
    { lng: 130.2300, lat: 33.5950, zoom: 14, name: '周辺エリア東' },
    { lng: 130.2100, lat: 33.5950, zoom: 14, name: '周辺エリア西' },
    { lng: 130.2163, lat: 33.5946, zoom: 16, name: 'キャンパス中央に戻る' }
];

let map = null;
let animationId = null;
let currentRouteIndex = 0;
let isAnimating = false;

// UI要素
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const speedSlider = document.getElementById('speedSlider');
const heightSlider = document.getElementById('heightSlider');
const pitchSlider = document.getElementById('pitchSlider');
const speedValue = document.getElementById('speedValue');
const heightValue = document.getElementById('heightValue');
const pitchValue = document.getElementById('pitchValue');
const statusText = document.getElementById('statusText');
const positionInfo = document.getElementById('positionInfo');
const tokenModal = document.getElementById('tokenModal');
const tokenInput = document.getElementById('tokenInput');
const saveTokenBtn = document.getElementById('saveTokenBtn');

// スライダーイベントリスナー
speedSlider.addEventListener('input', (e) => {
    speedValue.textContent = parseFloat(e.target.value).toFixed(1) + 'x';
});

heightSlider.addEventListener('input', (e) => {
    heightValue.textContent = e.target.value + 'm';
    // リアルタイムで高度を更新（アニメーション中でない場合）
    if (!isAnimating && map) {
        updateCameraHeight(parseInt(e.target.value));
    }
});

pitchSlider.addEventListener('input', (e) => {
    pitchValue.textContent = e.target.value + '°';
    // リアルタイムで角度を更新（アニメーション中でない場合）
    if (!isAnimating && map) {
        map.setPitch(parseInt(e.target.value));
    }
});

// ボタンイベントリスナー
startBtn.addEventListener('click', startAnimation);
stopBtn.addEventListener('click', stopAnimation);
resetBtn.addEventListener('click', resetCamera);

saveTokenBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (token) {
        localStorage.setItem('mapboxToken', token);
        mapboxAccessToken = token;
        tokenModal.style.display = 'none';
        initMap();
    } else {
        alert('アクセストークンを入力してください。');
    }
});

// アクセストークンの確認
if (!mapboxAccessToken) {
    tokenModal.style.display = 'block';
} else {
    initMap();
}

// モーダルが表示されている場合、入力済みのトークンがあれば自動入力
if (tokenModal.style.display === 'block' || !mapboxAccessToken) {
    const savedToken = localStorage.getItem('mapboxToken');
    if (savedToken) {
        tokenInput.value = savedToken;
    }
}

// Mapbox地図の初期化
function initMap() {
    if (!mapboxAccessToken) {
        console.error('Mapbox アクセストークンが設定されていません。');
        return;
    }

    mapboxgl.accessToken = mapboxAccessToken;

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // 衛星画像と道路のハイブリッドスタイル
        center: [130.2163, 33.5946], // 九州大学伊都キャンパス中央
        zoom: 15,
        pitch: 60, // カメラ角度
        bearing: 0
    });

    map.on('load', () => {
        console.log('地図が読み込まれました');
        
        // 3D地形を有効化
        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });
        
        // 地形の設定
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
        
        // カメラ高度の初期設定
        updateCameraHeight(parseInt(heightSlider.value));
        
        // 位置情報の更新
        updatePositionInfo();
        
        // カメラ移動時の位置情報更新
        map.on('move', updatePositionInfo);
        
        statusText.textContent = '地図読み込み完了';
    });

    map.on('error', (e) => {
        console.error('Mapboxエラー:', e);
        if (e.error && e.error.message && e.error.message.includes('token')) {
            statusText.textContent = 'エラー: アクセストークンが無効です';
            tokenModal.style.display = 'block';
        }
    });
}

// カメラ高度を更新
function updateCameraHeight(heightMeters) {
    if (!map) return;
    
    const center = map.getCenter();
    const zoom = map.getZoom();
    
    // メートル単位の高度をズームレベルに変換
    // 近似式: height ≈ (40075017 / (512 * 2^zoom)) * 0.5
    // 逆算して適切なズームレベルを計算
    const targetZoom = Math.log2(40075017 / (heightMeters * 2 * 512));
    
    // より正確な高度制御のため、flyToを使用
    map.easeTo({
        center: center,
        zoom: Math.max(10, Math.min(20, targetZoom)),
        duration: 0 // 即座に更新
    });
}

// 位置情報を更新
function updatePositionInfo() {
    if (!map) return;
    
    const center = map.getCenter();
    const zoom = map.getZoom();
    
    // 簡易的な高度計算（実際の標高ではない）
    const approxHeight = Math.round((40075017 / (512 * Math.pow(2, zoom))) * 0.5);
    
    positionInfo.textContent = 
        `緯度: ${center.lat.toFixed(4)}, 経度: ${center.lng.toFixed(4)}, 高度: ${approxHeight}m`;
}

// アニメーション開始
function startAnimation() {
    if (!map || isAnimating) return;
    
    isAnimating = true;
    currentRouteIndex = 0;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusText.textContent = 'アニメーション実行中...';
    
    flyToNextPoint();
}

// 次のポイントへ飛行
function flyToNextPoint() {
    if (!isAnimating || !map) return;
    
    if (currentRouteIndex >= flightRoute.length) {
        // ルートをリセットしてループ
        currentRouteIndex = 0;
    }
    
    const point = flightRoute[currentRouteIndex];
    const speed = parseFloat(speedSlider.value);
    const height = parseInt(heightSlider.value);
    const pitch = parseInt(pitchSlider.value);
    
    // 高度から適切なズームレベルを計算
    const targetZoom = Math.log2(40075017 / (height * 2 * 512));
    const finalZoom = Math.max(10, Math.min(20, targetZoom));
    
    // 飛行時間を速度に応じて調整（基本時間: 4000ms）
    const duration = 4000 / speed;
    
    statusText.textContent = `飛行中: ${point.name} (${currentRouteIndex + 1}/${flightRoute.length})`;
    
    map.flyTo({
        center: [point.lng, point.lat],
        zoom: point.zoom > finalZoom ? point.zoom : finalZoom,
        pitch: pitch,
        bearing: getBearing(currentRouteIndex),
        duration: duration,
        essential: true // アニメーションが中断されないように
    });
    
    // 次のポイントへ移動するタイミングを設定
    currentRouteIndex++;
    
    animationId = setTimeout(() => {
        if (isAnimating) {
            flyToNextPoint();
        }
    }, duration);
}

// 現在のルートインデックスに基づいて方位を計算
function getBearing(index) {
    if (index === 0 || index >= flightRoute.length) return 0;
    
    const prev = flightRoute[index - 1];
    const curr = flightRoute[index];
    
    // 方位角を計算
    const dLon = (curr.lng - prev.lng) * Math.PI / 180;
    const lat1 = prev.lat * Math.PI / 180;
    const lat2 = curr.lat * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
}

// アニメーション停止
function stopAnimation() {
    if (animationId) {
        clearTimeout(animationId);
        animationId = null;
    }
    
    isAnimating = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.textContent = 'アニメーション停止';
    
    // 現在の飛行を停止
    if (map) {
        map.stop();
    }
}

// カメラを初期位置にリセット
function resetCamera() {
    stopAnimation();
    
    if (!map) return;
    
    map.flyTo({
        center: [130.2163, 33.5946], // 九州大学伊都キャンパス中央
        zoom: 15,
        pitch: 60,
        bearing: 0,
        duration: 2000
    });
    
    // スライダーもリセット
    speedSlider.value = 1.0;
    heightSlider.value = 2000;
    pitchSlider.value = 60;
    speedValue.textContent = '1.0x';
    heightValue.textContent = '2000m';
    pitchValue.textContent = '60°';
    
    statusText.textContent = '初期位置に戻りました';
}
