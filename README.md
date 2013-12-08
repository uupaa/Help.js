Help.js
=======

Help.js は、ソースコードのクイックダンプと、オンラインヘルプ機能を提供します。

# コードとドキュメントの分離

## javadoc

[javadoc](http://en.wikipedia.org/wiki/Javadoc) や、[JsDoc](http://usejsdoc.org/) は、
ソースコードからHTML形式のAPIドキュメントを生成するツールです。

関数の外側に設置したブロックコメント( `/** ... */` )の中に、  
サンプルコードや `@param` や `@return` などのタグを埋め込み、
javadoc コマンドによりHTMLを生成します。

## サンプルコードをソースコードに直接埋め込むやり方の問題点

javadoc のようにサンプルコードをソースコードに直接埋め込むと、  
いくつかの運用上の問題を抱えてしまうと考えられます。

- 詳細なサンプルコードを書こうとすると、ソースコードの見通しが悪化してしまう
- サンプルコードのリテイクで、コードに差分が発生してしまう
- テキスト以外の情報をソースコードに直接埋め込むのは無理がある

特に画像や動画、実際にサンプルコードを利用する場合は、  
ソースコードに直接埋め込まず、  
オンライン上のページに設置する方法が望まれます。

## Help.js によるオンラインヘルプ

Help.js は `function() { ...` で始まる関数の実装の内側に `@help` タグを追加することで、  
ソースコードとドキュメントを分離し、  
ドキュメントをオンライン上に配置する、新しい仕組み(オンラインヘルプ機能)を提供します。

## Help.js スタイルのタグ

Help.js は `@help` タグの情報を利用します。  
それ以外にも以下のタグが利用されます。

| 名前          | タグ                              |
|---------------|-----------------------------------|
| ヘルプ        | `@help`                           |
| 引数          | `@arg` または `@param`            |
| 戻り値        | `@ret` または `@return`           |
| 概要          | `@desc` または `@description`     |
| 例外          | `@throw` または `@throws`         |
| 廃止          | `@deprecated`                     |

Help.js では、  
サンプルコードやHTMLタグをソースコードに直接埋め込まず、  
オンライン上のページに配置するのがルールです。

## Help コマンドの使い方

Help.js を組み込んだ環境では、
DevTools のコンソールで、 Help( `関数名` ) ENTER とタイプすることで、  
関数のソースコードのクイックダンプと、GitHub の Wiki ページ や Google 検索ページリンクを表示します。

`関数名` の部分には、文字列または関数を指定可能です。

```js
// 以下は全て同じ結果になります
> Help(Postal.prototype.register)
> Help("Postal.prototype.register")
> Help("Postal#register")
```

```js
function register(receiver) { // @arg ReceiverObject:
                              // @ret this:
                              // @throw: Error("Object has not inbox function.")
                              // @desc: register the object for message delivery.
                              // @help: Postal#register
    _validate( ... );
    if ( ... ) {
        :
    }
    return this;
}

GitHub: https://github.com/uupaa/postal.js/wiki/Postal#postalprototyperegister
Google: http://www.google.com/search?lr=lang_ja&ie=UTF-8&oe=UTF-8&q=Postal.prototype.register
MDN:    http://www.google.com/search?btnI=I%27m+Feeling+Lucky&lr=lang_ja&ie=UTF-8&oe=UTF-8&q=MDN%20Postal.prototype.register
```

ソースコードと共に表示されるリンクは、直接クリックできます(Firefoxではクリックできません)。

# 自作ライブラリを Help.js に対応させる

GitHub にホストしている自作ライブラリ(例: Hoge.js)を Help.js に対応させる方法を説明します。

1.  Hoge.repository = `GitHubのリポジトリURL` を追加します。

    ```js
    Hoge.repository = "https://github.com/uupaa/hoge.js";
    ```

2.  wiki ページ( https://github.com/uupaa/hoge.js/wiki/Hoge )を作成します。

3.  wiki/Hoge ページに API の説明を追加します。  
    Hoge.prototype.method は Hoge#method と省略せず、そのまま記述してください。

    ```wiki
    # Hoge.prototype.method    
    Hoge.prototype.method(arg1:String, arg2:Boolean = false):this は…
    ```

4.  Hoge.js の Hoge#method に `@help: Hoge#method` タグをコメントで追加していきます。  
    同時に引数(`@arg`)や戻り値(`@ret`), 概要(`@desc`)などのタグを追加するとよいでしょう。

    ```js
    function method(arg1,   // @arg String: arg1 description
                    arg2) { // @arg Boolean(= false): arg2 description
                            // @ret this: return value
                            // @desc: hoge method description
                            // @help: Hoge#method
        arg2 = arg2 || false;
            :
        return this;
    }
    ```

