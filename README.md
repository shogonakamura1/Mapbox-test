# Mapbox 3D 地形ビュー検証アプリ

九州大学伊都キャンパス周辺の3D地形を表示し、カメラの自動飛行アニメーションを体験できるWebアプリケーションです。

## 機能

- 🗺️ **3D地形表示**: Mapbox GL JSを使用した3D地形ビュー
- 🎬 **カメラアニメーション**: 九州大学伊都キャンパス周辺を自動飛行
- 🎚️ **調整可能なパラメータ**:
  - アニメーション速度（0.1x 〜 2.0x）
  - 飛行高度（100m 〜 5000m）
  - カメラ角度（0° 〜 85°）
- 🎮 **直感的なUI**: 開始/停止/リセットボタンとリアルタイム状態表示

## 必要な準備

### 1. Mapbox アカウントの作成

1. [Mapbox 公式サイト](https://www.mapbox.jp/)にアクセス
2. 「Sign up」をクリックしてアカウントを作成
   - 無料枠ありで試せます
3. ログイン後、[Access Tokens ページ](https://account.mapbox.com/access-tokens/)に移動
4. **Default Public Token** をコピーする

### 2. アクセストークンの設定

#### 方法1: .env ファイルを使用（推奨）

1. プロジェクトルートに `.env` ファイルを作成（以下の内容で）：

```bash
# Mapbox アクセストークン
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNrdGVzdGluZyJ9
```

**重要**: `pk.eyJ1Ijoi...` の部分を実際のMapboxアクセストークンに置き換えてください。

2. 設定ファイルを生成：

```bash
npm run setup
# または
node setup.js
```

これで `.env` から `config.js` が自動生成され、アプリ起動時にトークンが読み込まれます。

**注意**: `.env` ファイルは `.gitignore` に含まれているため、Gitにはコミットされません。チームで開発する場合は、各メンバーが各自の `.env` ファイルを作成してください。

#### 方法2: ブラウザのモーダルダイアログを使用

`.env` ファイルを設定しない場合、アプリを初回起動時に画面上のモーダルダイアログでアクセストークンを入力できます。

- トークンはブラウザのローカルストレージに保存されます
- 次回以降は自動的に使用されます
- トークンを変更したい場合は、ブラウザの開発者ツールからローカルストレージを削除するか、以下のJavaScriptをコンソールで実行してください：
  ```javascript
  localStorage.removeItem('mapboxToken');
  location.reload();
  ```

**優先順位**: ローカルストレージ > config.js (.env) > モーダル入力

## セットアップ

### 初回セットアップ

1. `.env` ファイルを作成してアクセストークンを設定（上記参照）
2. 設定ファイルを生成：

```bash
npm run setup
```

3. ローカルサーバーを起動（下記参照）

## 使い方

### ローカルサーバーで起動

このアプリは静的ファイルのみで動作するため、ローカルサーバーで起動してください。

#### 方法1: npm scripts を使用（推奨）

```bash
# .env ファイルから config.js を生成（初回のみ、または .env を変更した後）
npm run setup

# サーバーを起動
npm start
# または
npm run start:python
# または
npm run start:node
```

#### 方法2: Python を使用

```bash
# Python 3.x がインストールされている場合
python -m http.server 8000

# または
python3 -m http.server 8000
```

#### 方法3: Node.js (http-server) を使用

```bash
# http-server をインストール（初回のみ）
npm install -g http-server

# サーバーを起動
http-server -p 8000
```

#### 方法4: VS Code の Live Server 拡張機能

1. VS Code に「Live Server」拡張機能をインストール
2. `index.html` を右クリック → 「Open with Live Server」

**注意**: VS Code の Live Server を使用する場合も、事前に `npm run setup` を実行して `config.js` を生成しておく必要があります。

### アクセス

ブラウザで以下のURLにアクセス：

```
http://localhost:8000
```

### 操作方法

1. **アニメーション開始**: 「アニメーション開始」ボタンをクリック
2. **アニメーション停止**: 「アニメーション停止」ボタンをクリック
3. **初期位置に戻る**: 「初期位置に戻る」ボタンをクリック
4. **パラメータ調整**: 
   - スライダーでアニメーション速度、飛行高度、カメラ角度を調整
   - リアルタイムで反映されます

## ファイル構成

```
Mapbox-test/
├── index.html      # メインHTMLファイル
├── app.js         # Mapbox初期化とアニメーション制御
├── styles.css     # スタイルシート
├── setup.js       # .env から config.js を生成するスクリプト
├── package.json   # npm scripts の定義
├── .env           # 環境変数ファイル（gitignore対象、要作成）
├── .env.example   # .env のテンプレート
├── config.js      # 自動生成される設定ファイル（gitignore対象）
├── .gitignore     # Git除外設定
└── README.md      # このファイル
```

## 技術スタック

- **Mapbox GL JS v3.0.1**: 3D地形表示ライブラリ
- **HTML5 / CSS3 / JavaScript (ES6+)**: フロントエンド

## 飛行ルート

アプリは以下の6つのポイントを順番に飛行します：

1. キャンパス北側
2. キャンパス中央（九州大学伊都キャンパス）
3. キャンパス南側
4. 周辺エリア東
5. 周辺エリア西
6. キャンパス中央に戻る（ループ）

## トラブルシューティング

### 地図が表示されない

- アクセストークンが正しく設定されているか確認
- ブラウザのコンソールでエラーメッセージを確認
- Mapboxアカウントの利用制限を確認（無料枠の範囲内か）

### アニメーションが動作しない

- 地図の読み込みが完了しているか確認（「地図読み込み完了」と表示されているか）
- ブラウザのコンソールでエラーメッセージを確認

### トークンを再設定したい

#### .env ファイルを使用している場合

1. `.env` ファイルを編集してトークンを変更
2. `npm run setup` を実行して `config.js` を再生成
3. ブラウザをリロード

#### ブラウザのローカルストレージを使用している場合

ブラウザの開発者ツール（F12）を開き、コンソールで以下を実行：

```javascript
localStorage.removeItem('mapboxToken');
location.reload();
```

## ライセンス

このプロジェクトは検証目的のためのサンプルアプリケーションです。

Mapbox GL JS のライセンスについては、[Mapbox Terms of Service](https://www.mapbox.com/legal/tos) を参照してください。

## 参考リンク

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [Mapbox Styles](https://docs.mapbox.com/api/maps/styles/)
- [Mapbox Terrain](https://docs.mapbox.com/mapbox-gl-js/example/add-terrain/)
