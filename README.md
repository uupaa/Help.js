Help.js
=======

Help.js は、関数のソースコードをダンプし、ページへのリンクを表示します。

DevTools のコンソール上で、Help(functionName:Function/String) をタイプすることで、

- 関数のソースコードを表示します
- GitHub の Wiki ページ または Google 検索ページリンクを表示し、クリックでWebページを直接開きます
    - 一部ブラウザでは機能しません

```js
// 以下は全て同じ結果になります
> Help(Postal.prototype.register)
> Help("Postal.prototype.register")
> Help("Postal#register")

https://github.com/uupaa/postal.js/wiki/Postal#postalregister

function register(receiver) { // @arg ReceiverObject:
                              // @ret this:
                              // @desc: register the object for message delivery.
                              // @help: Postal#register
    ;
}

https://github.com/uupaa/postal.js/wiki/Postal#postalregister
```

# 自作ライブラリを Help.js に対応させる

GitHub にホストしている自作ライブラリ(例: Hoge.js)を Help.js に対応させる方法を説明します。

1.  Hoge.repository = `GitHubのリポジトリURL` を追加します。

    ```js
    Hoge.repository = "https://github.com/uupaa/hoge.js";
    ```

2.  wiki ページ( https://github.com/uupaa/hoge.js/wiki/Hoge )を作成します。

3.  wiki/Hoge ページに API の説明を追加します。  
    prototype は "#" で省略表記します(例: Hoge.prototype.method → Hoge#method)

    ```wiki
    # Hoge#method    
    Hoge#method(arg1:String, arg2:Boolean = false):this は…
    ```

4.  Hoge.js の Hoge#method に `@help: Hoge#method` 属性をコメントで追加していきます。  
    同時に引数や戻り値などの属性を追加するとよいでしょう。

    ```js
    function method(arg1,   // @arg String: arg1 description
                    arg2) { // @arg Boolean(= false): arg2 description
                            // @ret this: return value
                            // @desc: hoge method description
                            // @help: Hoge#method
            :
        return this;
    }
    ```

以上です。

