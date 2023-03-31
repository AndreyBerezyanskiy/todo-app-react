import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Todo } from '../../types/Todo';
import { TodoItem } from '../TodoItem';

interface Props {
  todos: Todo[];
  tempTodo: Todo | null;
  onDeleteTodo: (todoId: number) => void;
  deletedTodos: number[];
  onUpdateTodo: (id: number, title: string, status: boolean,) => void;
}

export const TodoList: React.FC<Props> = ({
  todos,
  tempTodo,
  onDeleteTodo,
  deletedTodos,
  onUpdateTodo,
}) => (
  <section className="todoapp__main">
    <TransitionGroup>
      {todos.map(todo => (
        <CSSTransition
          key={todo.id}
          timeout={300}
          classNames="item"
        >
          <TodoItem
            todo={todo}
            onDeleteTodo={onDeleteTodo}
            deletedTodos={deletedTodos}
            onUpdateTodo={onUpdateTodo}
          />
        </CSSTransition>

      ))}
      {tempTodo && (
        <CSSTransition
          key={0}
          timeout={300}
          classNames="temp-item"
        >
          <TodoItem
            todo={tempTodo}
            onDeleteTodo={onDeleteTodo}
            deletedTodos={deletedTodos}
            onUpdateTodo={onUpdateTodo}
          />
        </CSSTransition>
      )}
    </TransitionGroup>
  </section>
);
