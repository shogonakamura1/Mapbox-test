#!/usr/bin/env node

/**
 * .env ファイルから config.js を生成するスクリプト
 * 使用方法: node setup.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const configPath = path.join(__dirname, 'config.js');
const envExamplePath = path.join(__dirname, '.env.example');

// .env ファイルの存在確認
if (!fs.existsSync(envPath)) {
    console.error('❌ .env ファイルが見つかりません。');
    console.log('\n📝 .env ファイルを作成してください:');
    console.log('   1. .env.example を .env にコピー');
    console.log('   2. .env ファイルを開いて MAPBOX_ACCESS_TOKEN を設定');
    console.log('   3. 再度このコマンドを実行\n');
    
    // .env.example が存在する場合は表示
    if (fs.existsSync(envExamplePath)) {
        console.log('💡 例:');
        console.log('   cp .env.example .env');
    }
    process.exit(1);
}

// .env ファイルを読み込む
const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

let mapboxToken = '';

// .env ファイルから MAPBOX_ACCESS_TOKEN を抽出
for (const line of lines) {
    // コメント行をスキップ
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
    }
    
    // KEY=VALUE 形式をパース
    const match = trimmedLine.match(/^MAPBOX_ACCESS_TOKEN=(.+)$/);
    if (match) {
        // クォートを削除
        mapboxToken = match[1].replace(/^["']|["']$/g, '');
        break;
    }
}

if (!mapboxToken) {
    console.error('❌ .env ファイルに MAPBOX_ACCESS_TOKEN が見つかりません。');
    console.log('\n📝 .env ファイルに以下の行を追加してください:');
    console.log('   MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoi...\n');
    process.exit(1);
}

if (mapboxToken === 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNrdGVzdGluZyJ9.example') {
    console.warn('⚠️  .env ファイルにサンプルトークンが設定されています。');
    console.log('   実際のMapboxアクセストークンを設定してください。\n');
}

// config.js を生成
const configContent = `// このファイルは自動生成されます。直接編集しないでください。
// .env ファイルを編集してから 'npm run setup' または 'node setup.js' を実行してください。

// Mapbox アクセストークン（.env ファイルから読み込み）
window.MAPBOX_ACCESS_TOKEN = '${mapboxToken}';
`;

try {
    fs.writeFileSync(configPath, configContent, 'utf-8');
    console.log('✅ config.js を生成しました。');
    console.log(`   Mapbox トークン: ${mapboxToken.substring(0, 20)}...\n`);
} catch (error) {
    console.error('❌ config.js の生成に失敗しました:', error.message);
    process.exit(1);
}
