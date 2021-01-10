function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

$(document).ready(function(){
	const show_watches = true;
	const show_even = true;
	const token = 'YOUR GITHUB TOKEN HERE';
	let use_api = true;

	$( ".repo" ).each(function(i){
		const repo_link = $(this).find('a').last().attr('href');
		const is_selected_repo = $(this).find('a').last().attr('class') == 'Link--secondary';

		if(!is_selected_repo){
			let watches = 0;
			let stars = 0;
			let commits_string = '';

			$(this).append(`
				<div class="loading_indicator">
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					<div class="loader"></div>&nbsp;getting data...
				</div>
				`);

			if(use_api){
				// Through Github REST API:
				// Get repo data:
				let child_owner, child_branch, parent_owner, parent_branch, repo_name;
				$.ajax({
					url: `https://api.github.com/repos${repo_link}`,
					async: false,
					headers: {
						Accept: "application/vnd.github.v3+json",
						Authorization: `token ${token}`
					},
					success : function(response) {
						console.log(response);
						//commits_string = commit_data;
						watches = response.watchers;
						stars = response.stargazers_count;
						child_owner = response.owner.login;
						child_branch = response.default_branch;
						parent_owner = response.parent.owner.login;
						parent_branch = response.parent.default_branch;
						repo_name = response.name;
					},
					error : function(jqXHR, textStatus, errorThrown){
						console.log(errorThrown);
					}
				});
				// Get commits ahead / behind data:
				let url = `https://api.github.com/repos/${parent_owner}/${repo_name}/compare/${parent_branch}...${child_owner}:${child_branch}`;
				console.log(url);
				$.ajax({
					url: url,
					async: false,
					headers: {
						Accept: "application/vnd.github.v3+json",
						Authorization: `token ${token}`
					},
					success : function(response) {
						//console.log(response);
						const commits_ahead = response.ahead_by;
						const commits_behind = response.behind_by;
						const status = response.status;
						console.log(`ahead: ${commits_ahead}, behind: ${commits_behind}, status: ${status}`);
						commits_string = '';
						if(commits_ahead == 0 && commits_behind == 0){
							commits_string = 'even';
						} else {
							if(commits_ahead > 0){
								commits_string += `<strong>${commits_ahead}</strong> ahead`;
							}
							if(commits_behind > 0){
								if(commits_string != ''){
									commits_string += `, <strong>${commits_behind}</strong> behind`;
								} else {
									commits_string += `<strong>${commits_behind}</strong> behind`;
								}
							}
						}
					},
					error : function(jqXHR, textStatus, errorThrown){
						console.log(errorThrown);
					}
				});
			}
			// Not 'else' because use_api can disable automatically if API request limit reached
			if(!use_api){
				// Through parsing DOM of repo HTML pages:
				$.ajax({
					url: `https://github.com${repo_link}`,
					async: false,
					success : function(response) {
						const counters = $(response).find('.social-count');
						let commit_data = $(response).find('.file-navigation').next().find('.flex-auto').html().trim();
						const regex = /This branch is (.*) \w+:\w+\./gm;
						const match = regex.exec(commit_data);
						commit_data = match[1];
						commit_data = commit_data.replaceAll(/ of| with| commits?/g, '');
						commits_string = commit_data;
						watches = parseInt(counters[0].text);
						stars = parseInt(counters[1].text);
					},
					error : function(jqXHR, textStatus, errorThrown){
						console.log(errorThrown);
					}
				});
			}			

			$(this).find('.loading_indicator').remove();
			
			if(commits_string != ''){
				$(this).append(`
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<a class="link-gray-dark no-underline" href="${repo_link}/commits/master">
					<svg class="octicon octicon-history text-gray" height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true">
						<path fill-rule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"></path>
					</svg>
					${commits_string}
				</a>
				`);
			}			

			if(stars > 0){
				$(this).append(`
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<svg class="octicon octicon-star mr-1 text-gray" height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true">
					<path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path>
				</svg>
				<a class="link-gray-dark no-underline" href="${repo_link}/stargazers">
					<strong>${stars}</strong>
				</a>
				`);
			}
			// Repo owner is watching own repo by default
			// Showing 1 for every repo is useless:
			if(show_watches && watches > 1){
				$(this).append(`
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<svg class="octicon octicon-eye text-gray" height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true">
					<path fill-rule="evenodd" d="M1.679 7.932c.412-.621 1.242-1.75 2.366-2.717C5.175 4.242 6.527 3.5 8 3.5c1.473 0 2.824.742 3.955 1.715 1.124.967 1.954 2.096 2.366 2.717a.119.119 0 010 .136c-.412.621-1.242 1.75-2.366 2.717C10.825 11.758 9.473 12.5 8 12.5c-1.473 0-2.824-.742-3.955-1.715C2.92 9.818 2.09 8.69 1.679 8.068a.119.119 0 010-.136zM8 2c-1.981 0-3.67.992-4.933 2.078C1.797 5.169.88 6.423.43 7.1a1.619 1.619 0 000 1.798c.45.678 1.367 1.932 2.637 3.024C4.329 13.008 6.019 14 8 14c1.981 0 3.67-.992 4.933-2.078 1.27-1.091 2.187-2.345 2.637-3.023a1.619 1.619 0 000-1.798c-.45-.678-1.367-1.932-2.637-3.023C11.671 2.992 9.981 2 8 2zm0 8a2 2 0 100-4 2 2 0 000 4z"></path>
				</svg>
				<a class="link-gray-dark no-underline" href="${repo_link}/watchers">
					<strong>${watches}</strong>
				</a>
				`);
			}
		}
	});
});
