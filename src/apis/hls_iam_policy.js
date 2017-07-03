// Version 0.0.1 copied from original hls-mqtt-broker

function oneLevelHigher(action, divider) {
	if (action.substr(-1) == "*") {
		action = action.substr(0, action.length - 2)
	}
	var lastIndex = action.lastIndexOf(divider);
	return (lastIndex == -1) ? false : action.substr(0, lastIndex) + divider + "*"
}

function canPerformAction(policy, action) {
	if (action in policy) {
		return action;
	}
	action = oneLevelHigher(action, ":")
	return action == false ? false : canPerformAction(policy, action)
}

function canUseResource(policy, action, resource) {
    if (policy[action]['resources']['values'].indexOf(resource) != -1) {
		return true;
    }
	resource = oneLevelHigher(resource, "/")
	return resource == false ? false : canUseResource(policy, action, resource)
}

function checkPolicy(policy, action, resource) {
	console.log(`Check policy: ${action} -> ${resource}`);
	var action = canPerformAction(policy, action);
	console.log('Can perform action: ' + (action ? 'yes' : 'no'));
	if (action !== false) {
		if (canUseResource(policy, action, resource)) {
			console.log('On resource: yes');

			return true;
		}
	console.log('On resource: no');

	}
	return false;
}

module.exports = {
    oneLevelHigher,
    canPerformAction,
    canUseResource,
    checkPolicy
}