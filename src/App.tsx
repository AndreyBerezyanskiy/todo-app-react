/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { UserWarning } from './UserWarning';
import { Todo } from './types/Todo';
import {
  addTodo, deleteTodo, getTodos, updateTodo,
} from './api/todos';
import { TodoList } from './components/TodoList';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Notification } from './components/Notification';
import { SortType } from './types/SortType';
import { prepareTodos } from './utils/prepareTodos';
import { ErrorType } from './types/ErrorType';

const USER_ID = 6358;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorType, setErrorType] = useState(ErrorType.NONE);
  const [sortType, setSortType] = useState<SortType>(SortType.ALL);
  const [isLoading, setIsLoading] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [deletedTodos, setDeletedTodos] = useState<number[]>([]);

  const isTodos = todos.length !== 0;
  const activeTodosAmount = todos.filter(todo => !todo.completed).length;
  const isCompletedTodos = todos.some(todo => todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  const isAllCompleted = todos.length === completedTodos.length;

  const autoCloseNotification = () => {
    setTimeout(() => {
      setErrorType(ErrorType.NONE);
    }, 3000);
  };

  const addErrorMessage = (errorMessage: ErrorType) => {
    setErrorType(errorMessage);
    autoCloseNotification();
  };

  const fetchedTodos = async () => {
    try {
      setErrorType(ErrorType.NONE);
      const data = await getTodos(USER_ID);

      setTodos(data);
      setIsLoading(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      addErrorMessage(ErrorType.GET);
    }
  };

  useEffect(() => {
    fetchedTodos();
  }, []);

  const handleSortTodos = useCallback((sort: SortType) => {
    setSortType(sort);
  }, []);

  const handleCloseNotification = useCallback(() => {
    setErrorType(ErrorType.NONE);
  }, []);

  const visibleTodos = useMemo(() => (
    prepareTodos(todos, sortType)
  ), [todos, sortType]);

  const handleAddTodo = async (title: string, userId: number) => {
    const newTempTodo = {
      id: 0,
      userId: USER_ID,
      title,
      completed: false,
    };

    try {
      setIsLoading(true);
      setTempTodo(newTempTodo);

      await addTodo(title, userId);
      await fetchedTodos();
    } catch (error) {
      addErrorMessage(ErrorType.ADD);
    } finally {
      setTempTodo(null);
      setIsLoading(false);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      setDeletedTodos(prevId => ([...prevId, todoId]));
      await deleteTodo(todoId);
      await fetchedTodos();
    } catch (error) {
      addErrorMessage(ErrorType.DELETE);
    } finally {
      setDeletedTodos([]);
    }
  };

  const handleClearCompleted = () => {
    completedTodos.forEach(todo => {
      handleDeleteTodo(todo.id);
    });
  };

  const handleUpdateTodo = async (
    todoId: number,
    title: string,
    completed: boolean,
  ) => {
    try {
      setDeletedTodos(prevId => ([...prevId, todoId]));
      await updateTodo(todoId, title, completed);
      await fetchedTodos();
    } catch (error) {
      addErrorMessage(ErrorType.UPDATE);
    } finally {
      setDeletedTodos([]);
    }
  };

  const handleToggleAllTodos = () => {
    if (isAllCompleted) {
      completedTodos.forEach(todo => {
        const { id, title, completed } = todo;

        handleUpdateTodo(id, title, !completed);
      });

      return;
    }

    todos.forEach(todo => {
      const { id, title } = todo;

      handleUpdateTodo(id, title, true);
    });
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">

        <Header
          userId={USER_ID}
          onAddTodo={handleAddTodo}
          onAddErrorMessage={addErrorMessage}
          isLoading={isLoading}
          isAllCompleted={isAllCompleted}
          onToggleAllTodos={handleToggleAllTodos}
        />

        <TodoList
          todos={visibleTodos}
          tempTodo={tempTodo}
          onDeleteTodo={handleDeleteTodo}
          deletedTodos={deletedTodos}
          onUpdateTodo={handleUpdateTodo}
        />

        {isTodos && (
          <Footer
            activeTodosAmount={activeTodosAmount}
            onSort={handleSortTodos}
            sortType={sortType}
            onClearCompletedTodos={handleClearCompleted}
            isCompletedTodo={isCompletedTodos}
          />
        )}
      </div>

      {errorType && (
        <Notification
          errorType={errorType}
          onCloseNotification={handleCloseNotification}
        />
      )}
    </div>
  );
};
