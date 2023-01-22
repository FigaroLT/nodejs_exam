const createElementWithParams = (tagName, params) => {
	const element = document.createElement(tagName);

	Object.assign(element, params);

	return element;
};

const populateGroupList = (members) => {
	const createMembersList = document.querySelector('#allGroups');
	createMembersList.innerHTML = '';

	const elementList = document.createElement('div');
	createMembersList.append(elementList);

	elementList.className = 'groupList';

	members.forEach((member) => {
		const rowElement = document.createElement('div');

		const groupTitle = createElementWithParams('div', {
			textContent: member.name,
		});

		const groupUrl = document.createElement('a');
		const urlLink = document.createTextNode(`Id: ${member.group_id}`);
		groupUrl.appendChild(urlLink);
		groupUrl.href = `./bills.html?group_id=${member.group_id}`;

		groupTitle.className = 'groupTitle';
		groupUrl.className = 'groupUrl';

		rowElement.className = 'record';

		rowElement.append(groupUrl, groupTitle);

		elementList.append(rowElement);
	});

	createMembersList.append(elementList);
};

export { populateGroupList };
