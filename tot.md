オプショナルチェーン ?.
nullish(null or undefined) --> return undefined rather than error

Warning: Each child in a list should have a unique “key” prop.」の回避はコンポーネントの呼び出され側ではなく呼び出し側で行う

&nbsp;


You can easily customize the appearance of a MUI component.
https://mui.com/customization/how-to-customize/
.css-ae2u5c-MuiSlider-thumb
[hash]-Mui[Component name]-[name of the slot]

Global CSS override
Components expose global class names to enable customization with CSS.


grid breakpoint
https://next--material-ui.netlify.app/ja/components/grid/
flexgrow
https://dekiru.net/article/13237/
grid container tate
https://teech-lab.com/react-typescript-material-ui-grid-layout/1835/

https://qiita.com/tag1216/items/2935c9979b857bb7701f

item cardの大きさは 
        <Grid container justify="center" spacing={5} >
        {[1,2,3,4,5,6,7,8].map((product,idx) => (
            <Grid item key={idx} lg={3} >
            <Product />
            </Grid>
          ))}
        </Grid>
このgrid breakpointで決めた方がいい

改行pre
https://code-kitchen.dev/html/pre/
https://stackoverflow.com/questions/52463765/typography-in-react-material-ui

email
password
wishlist[product]
cartId


useEffect in detail
https://zenn.dev/syu/articles/3c4aa813b57b8c
なぜセットした値が更新されていないのか？
ex. map of undefined
なぜセットした値が更新されていないのかというと、setStateで値が更新されるのは関数が呼び出された後だから
https://gist.github.com/tagty/fbcae0998ad439017fd1ebd119393019

intern

async関数においてtry/catchではなくawait/catchパターンを活用する
https://qiita.com/akameco/items/cc73afcdb5ac5d0774bc

fetch() はサーバー側でエラーが起こってもレスポンスを reject してくれないということです。
レスポンスをreject してくれないということは、catch() の中でエラー処理できないということであり、then() の方にレスポンスが流れて行ってしまうということです。
Fetch API の仕様であり、正しい動作のよう
fetch() が結果を reject() するのはネットワークエラーのときだけ
サーバー側の処理が正常に行われたかどうかは、response.ok を見れば判断できる
https://blog.mudatobunka.org/entry/2016/04/26/092518