import { createComponent, RECEIVE_PROPS } from 'melody-component';
import { bindEvents, compose } from 'melody-hoc';
import { applyMiddleware } from 'melody-util';
import { lifecycle } from 'melody-hoc';
import createSagaMiddleware from 'redux-saga';

import mySaga from '../middleware/saga';
import template from './index.twig';

const initialState = {
	userInfo: null,
	isFetching: false,
	fetchFailure: false,
};

const USER_REQUEST = 'USER_REQUEST';
const USER_SUCCESS = 'USER_SUCCESS';
const USER_FAILURE = 'USER_FAILURE';

const submitRequest = userName => ({ type: USER_REQUEST, payload: userName, });

const stateReducer = (state = initialState, { type, payload, }) => {
	switch(type) {
		case RECEIVE_PROPS: {
			return {
				...state,
				...payload,
			};
		}
		case USER_REQUEST: {
			return {
				...state,
				userName: payload,
				isFetching: true,
				fetchFailure: false,
			};
		}
		case USER_SUCCESS: {
			return {
				...state,
				userInfo: payload,
				isFetching: false,
				fetchFailure: false,
			}
		}
		case USER_FAILURE: {
			return {
				...state,
				isFetching: false,
				fetchFailure: true,
			}
		}
	}
	return state;
}

const withClickHandlers = bindEvents({
	submitRequest: {
		click(event, { refs, dispatch, }) {
			const userName = refs.userInputBox.value;
			dispatch(submitRequest(userName));
		}
	},
});

const sagaMiddleware = createSagaMiddleware();

const lifeCycleEnhancer = lifecycle({
	componentDidMount(){
		this.sagaTask = sagaMiddleware.run(mySaga);
	},
	componentWillUnmount() {
		this.sagaTask.cancel();
	}
});


const component = createComponent(template, stateReducer, applyMiddleware(sagaMiddleware));

const enhancer = compose(withClickHandlers, lifeCycleEnhancer);

export default enhancer(component);
