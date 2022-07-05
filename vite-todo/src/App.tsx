import React, { useState } from 'react';

// フォームに入力されたvalueをTodo(string型)として保持
type Todo = {
  value:string;
  readonly id: number;  // readonlyプロパティ：読み取り専用
  checked: boolean;
  removed: boolean;
};

// フィルターステートの追加
type Filter = 'all' | 'checked' | 'unchecked' | 'removed';

export const App = () => {
   /*
   * text = ステートの値
   * setText = ステートの値を更新するメソッド
   * useState の引数 = ステートの初期値 (=空の文字列)
   */
  const [text, setText] = useState('');

  /*
  * useState<○○○>の中に型を指定しておくことで
  * ステートに型が異なる値を入れれないようにする
  */
  const [todos, setTodos] = useState<Todo[]>([]);

  // Filter型のステートで保持
  const [filter, setFilter] = useState<Filter>('all');


  // 新しいタスクの追加(Stateの更新)
  const handleOnSubmit = (
    e: React.FormEvent<HTMLFormElement | HTMLInputElement>
  ) => {
    e.preventDefault();

    // フォームが空白の場合はリターン
    if (!text) return;

    // 新しいTodoの作成
    const newTodo: Todo = {
      value: text,
      id: new Date().getTime(),
      checked: false,
      removed: false,
    };
    // スプレッド構文を用いてtodosステートのコピーへnewTodoを追加する
    setTodos([newTodo, ...todos]);
    // フォームへの入力を削除する
    setText("");
  };
  // テキスト入力フォームのコールバック
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  // 登録済みのTodoが編集されたときのコールバック
  const handleOnEdit = (id: number, value: string) => {
    /*
    * スプレッド構文でコピーしたものを
    * ディープコピーでTodo型オブジェクトの配列まるごと再生成する
    */
    const deepCopy = todos.map((todo) => ({ ...todo }));

    const newTodos = deepCopy.map((todo) => {
      if (todo.id === id) {
        todo.value = value;
      }
      return todo;
    });
    setTodos(newTodos);
  };

  // チェックボックスがチェックされたときのコールバック
  const handleOnCheck = (id: number, checked: boolean) => {
    const deepCopy = todos.map((todo) => ({ ...todo }));

    const newTodos = deepCopy.map((todo) => {
      if (todo.id === id) {
        todo.checked = !checked;
      }
      return todo;
    });
    setTodos(newTodos);
  };

  // 削除ボタンが押されたときのコールバック
  const handleOnRemove = (id: number, removed: boolean) => {
    const deepCopy = todos.map((todo) => ({ ...todo }));

    const newTodos = deepCopy.map((todo) => {
      if (todo.id === id) {
        todo.removed = !removed;
      }
      return todo;
    });
    setTodos(newTodos);
  };

  // フィルタリング後のTodo型の配列をリスト表示
  const filteredTodos = todos.filter((todo) => {
    // filter ステートの値に応じて異なる内容の配列を返す
    switch (filter) {
      case 'all':
        // 削除されていないもの全て
        return !todo.removed;
      case 'checked':
        // 完了済 **かつ** 削除されていないもの
        return todo.checked && !todo.removed;
      case 'unchecked':
        // 未完了 **かつ** 削除されていないもの
        return !todo.checked && !todo.removed;
      case 'removed':
        // 削除済みのもの
        return todo.removed;
      default:
        return todo;
    }
  });

  // ゴミ箱を空にするコールバック
  const handleOnEmpty = () => {
    const newTodos = todos.filter((todo) => !todo.removed);
    setTodos(newTodos);
  };

  return (
    <div>
      <select
        defaultValue="all"
        onChange={(e) => setFilter(e.target.value as Filter)}
      >
        <option value="all">すべてのタスク</option>
        <option value="checked">完了したタスク</option>
        <option value="unchecked">現在のタスク</option>
        <option value="removed">ごみ箱</option>
      </select>
      {/* フィルターが `removed` のときは「ごみ箱を空にする」ボタンを表示 */}
      {filter === 'removed' ? (
        <button onClick={handleOnEmpty}
          disabled={todos.filter((todo) => todo.removed).length === 0}
        >
          ごみ箱を空にする
        </button>
      ) : (
        // フィルターが `checked` でなければ入力フォームを表示
        filter !== 'checked' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOnSubmit(e);
            }}
          >
            <input
              type="text"
              value={text}
              onChange={(e) => handleOnChange(e)}
            />
            <input
              type="submit"
              value="追加"
              onSubmit={(e) => handleOnSubmit(e)}
            />
          </form>
        )
      )}
      <ul>
         {filteredTodos.map((todo) => {
          return (
            <li key={todo.id}>
              <input
                type="checkbox"
                disabled={todo.removed}
                checked={todo.checked}
                onChange={(e) => handleOnCheck(todo.id, todo.checked)}
              />
              <input
                type="text"
                disabled={todo.checked || todo.removed}
                value={todo.value}
                onChange={(e) => handleOnEdit(todo.id, e.target.value)}
              />
              <button onClick={() => handleOnRemove(todo.id, todo.removed)}>
                {todo.removed ? '復元' : '削除'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};