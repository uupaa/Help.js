Help.js
=======

Help.js は、開発者向けのオンラインヘルプ機能を提供します。

- Chrome DevTools のコンソールでメソッドのソースコードをダンプします
    - 引数や戻り値を素早く確認できます
- オンラインヘルプへのリンクを提供します
    - GitHub の Wiki ページへのリンクを表示します
    - または Google I'm Feeling Lucky へのリンクを提供します

# クイックヘルプ

クイックヘルプは、Chrome DevTools のコンソールで、  
`オブジェクト.help()` とタイプすることでソースコードとクリック可能なURLを表示する機能です。

```sh
> Postal.prototype.register.help()

https://github.com/uupaa/postal.js/wiki/Postal#postalregister

function register(receiver) { // @arg ReceiverObject:
                              // @ret this:
                              // @throw: Error("Object has not inbox function.")
                              // @desc: register the object for message delivery.
                              // @help: Postal#register
    _validate(receiver);
    if ( !getID(receiver) ) {
        var id = (++_counter).toString();

        if (Object.defineProperty) { // ES5 ready
            Object.defineProperty(receiver, "__POSTAL_ID__", { value: id }); // hidden and shield
        } else { // legacy
            receiver.__POSTAL_ID__ = id;
        }
        this._receiverMap[id] = receiver;
    }
    return this;
}

https://github.com/uupaa/postal.js/wiki/Postal#postalregister
```

Help(`object`) でも同様の結果になります。

```sh
> Help((new Postal()).register)

https://github.com/uupaa/postal.js/wiki/Postal#postal

  ...


https://github.com/uupaa/postal.js/wiki/Postal#postal
```

# オンラインヘルプ

クイックヘルプで表示したソースコードの上下には、クリック可能なURLが付属しています。

このURLをクリックすると、そのクラス/メソッドの使い方を説明したページが開きます。
これをオンラインヘルプ機能と呼びます。

- `Object`.repository が設定されている場合は、repository の wiki ページを表示します
- repository が設定されていない場合は、Google で検索します

## 自作ライブラリを Help.js のオンラインヘルプ機能に対応させる

Help.js のオンラインヘルプ機能に対応するには、以下のようにします。

`Object`.repository に GitHub のリポジトリURLを設定します。

```js
+ Hoge.repository = "https://github.com/uupaa/hoge.js";
```

`Object` 名を付けた wiki ページを作成します

```
  https://github.com/uupaa/postal.js/wiki/Postal ページを作成
```

- 作成した wiki ページに API の説明を追加していきます
    - メソッドは `"#"` で省略表記します
    - 例: Postal.prototype.register は Postal#register とします

```md
# Postal#register
register the object for message delivery.

# Postal#to
set delivery objects.
```

- 各メソッドに `@help: クラス名#メソッド名` 属性をコメントで追加していきます。

```js

function register(receiver) { // @arg ReceiverObject:
                              // @ret this:
                              // @throw: Error("Object has not inbox function.")
                              // @desc: register the object for message delivery.
                              // @help: Postal#register
    _validate(receiver);
    if ( !getID(receiver) ) {
        var id = (++_counter).toString();

        if (Object.defineProperty) { // ES5 ready
            Object.defineProperty(receiver, "__POSTAL_ID__", { value: id }); // hidden and shield
        } else { // legacy
            receiver.__POSTAL_ID__ = id;
        }
        this._receiverMap[id] = receiver;
    }
    return this;
}
```

以上で、オンラインヘルプが利用可能になります。

