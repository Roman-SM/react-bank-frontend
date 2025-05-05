import "./index.css";
import Page from "../../component/page";
import StatusBar from "../../component/status-bar";
import BackButton from "../../component/back-button";
import NotificationsList from "../../component/notifications-list";
import { useAuth } from "../../util/useAuth";
import { Alert, Skeleton } from "../../component/load";
import { useEffect, Fragment, useReducer, useCallback } from "react";
import {
  requestInitialState,
  requestReducer,
  REQUEST_ACTION_TYPE,
} from "../../util/request";

interface Notification {
  notifications: {
    id: string;
    date: string;
    type: string;
    text: string;
  }[];
}

const convertData = (raw: Notification) => ({
  list: [...(raw.notifications || [])]
    .reverse()
    .map(({ id, date, type, text }) => ({
      id,
      date,
      type,
      text,
    })),
  isEmpty: raw.notifications.length === 0,
});

export default function Component() {
  const [state, dispatch] = useReducer(requestReducer, requestInitialState);
  const { states } = useAuth();

  useEffect(() => {
    document.title = "Notifications";
  }, []);

  const getNotifications = useCallback(async () => {
    dispatch({ type: REQUEST_ACTION_TYPE.PROGRESS });
    try {
      const res = await fetch(
        "https://react-bank-backend-f5iu.onrender.com/notifications-list",
        {
          method: "GET",
          headers: {
            Authorization: `${states.user?.email}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        console.log("notifications data", data);
        dispatch({
          type: REQUEST_ACTION_TYPE.SUCCESS,
          payload: convertData(data),
        });
      } else {
        dispatch({ type: REQUEST_ACTION_TYPE.ERROR, payload: data.message });
      }
    } catch (error: any) {
      dispatch({
        type: REQUEST_ACTION_TYPE.ERROR,
        payload: error.message,
      });
    }
  }, [states.user?.email]);

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  return (
    <Page variant="gray">
      <StatusBar img="statusBarBlack" />
      <BackButton title="Notifications" retreat="retreat" />
      {state.status === REQUEST_ACTION_TYPE.PROGRESS && (
        <Fragment>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </Fragment>
      )}
      {state.status === REQUEST_ACTION_TYPE.SUCCESS && (
        <div className="notifications-list-scroll">
          {state.data.isEmpty ? (
            <Alert message="Список сповіщень пустий" />
          ) : (
            state.data.list.map((item: any) => (
              <Fragment key={item.id}>
                <NotificationsList {...item} />
              </Fragment>
            ))
          )}
        </div>
      )}
    </Page>
  );
}
