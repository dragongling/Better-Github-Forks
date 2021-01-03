function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

$(document).ready(function(){
	const show_watches = true;

	$( ".repo" ).each(function(i){
		const repo_link = $(this).find('a').last().attr('href');
		const is_selected_repo = $(this).find('a').last().attr('class') == 'Link--secondary';

		if(!is_selected_repo){
			const commits_ahead = 0;
			const commits_behind = 0;
			let watches = 0;
			let stars = 0;

			let commits_string = '';
			if(commits_ahead > 0){
				commits_string += `<strong>${commits_ahead}</strong> commit ahead`;
			}
			if(commits_behind > 0){
				if(commits_string != ''){
					commits_string += ` / <strong>${commits_behind}</strong> behind`;
				} else {
					commits_string += `<strong>${commits_behind}</strong> commit behind`;
				}
			}
			if(commits_string != ''){
				$(this).append(`
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<a class="link-gray-dark no-underline" href="${repo_link}/commits/master">
					${commits_string}
				</a>
				`);
			}

			// Through Github REST API:
			/*$.ajax({
				url: `https://api.github.com/repos${repo_link}`,
				headers: {
					Accept: "application/vnd.github.v3+json"
				},
				success : function(response) {
					console.log("success");
					console.log(response);
				},
				error : function(jqXHR, textStatus, errorThrown){
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				}
			});*/

			// Through parsing DOM of repo HTML pages:
			console.log(repo_link);
			$.ajax({
				url: `https://github.com${repo_link}`,
				async: false,
				success : function(response) {
					const counters = $(response).find('.social-count');
					watches = parseInt(counters[0].text);
					stars = parseInt(counters[1].text);					
					console.log(`watchers: ${watches}`);
					console.log(`stars: ${stars}`);
				},
				error : function(jqXHR, textStatus, errorThrown){
					console.log(errorThrown);
				}
			});

			if(stars > 0){
				$(this).append(`
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<svg class="octicon octicon-star mr-1" height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true">
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
				<svg class="octicon octicon-eye" height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true">
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
