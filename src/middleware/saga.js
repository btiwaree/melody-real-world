import { call, put, takeEvery } from 'redux-saga/effects';
import { createStructuredSelector } from 'reselect';

const logError = message => {
	if (process.env.NODE_ENV !== 'production') {
		console.log(`Error while fetching data: ${message}`)
	}
}

// selectors for getting only necessary info from github api response.
const idSelector = state => state.id;
const nameSelector = state => state.name;
const followersSelector = state => state.followers;
const followingSelector = state => state.following;
const publicReposSelector = state => state.public_repos;
const publicGistsSelector = state => state.public_gists;
const avatarSelector = state => state.avatar_url;
const profileUrlSelector = state => state.html_url;

const fetchApi = userName => fetch(`https://api.github.com/users/${userName}`).then(response => response.ok ? response.json() : false).catch(e => {
	logError(e);
	return false;
})

function* fetchUser(action) {
	try {
		const userInfo = yield call(fetchApi, action.payload);

		const structuredSelector = createStructuredSelector({
			id: idSelector,
			name: nameSelector,
			followers: followersSelector,
			following: followingSelector,
			publicRepos: publicReposSelector,
			publicGists: publicGistsSelector,
			avatar: avatarSelector,
			profileUrl: profileUrlSelector,
		});
		if (userInfo) {
			yield put({ type: 'USER_SUCCESS', payload: userInfo && structuredSelector(userInfo), });
		} else {
			yield put({ type: 'USER_FAILURE', payload: false, });
		}

	} catch (e) {
		logError(e);
	}
}

function* mySaga() {
	yield takeEvery('USER_REQUEST', fetchUser);
}

export default mySaga;
