# Janus-frontend

## これは何？

このリポジトリは、Janusのフロントエンド部分のリポジトリです。

## 技術スタック

- Next.js
- Auth0

## 環境構築

まず、[GitHubのリポジトリ](https://github.com/gotoukenta/janus-frontend)をクローンします。

```bash
cd リポジトリをおきたいディレクトリ
git clone https://github.com/gotoukenta/janus.git
```

次に、依存関係をインストールします。

```bash
cd janus-frontend
npm install
```

次に、環境変数を設定します。プロジェクトルートに `.env.local` ファイルを作成し、環境変数を設定します。環境変数は、[Retasusan](https://github.com/Retasusan)にコンタクトをとって、共有してもらってください。

最後に、開発サーバーを起動します。

```bash
npm run dev
```
