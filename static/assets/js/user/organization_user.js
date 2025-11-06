// === Utility Functions ===
const $ = (id) => document.getElementById(id);

const csrfHeaders = (extra = {}) => ({
  "X-CSRFToken": getCookie("csrftoken"),
  ...extra,
});

// === Form Handling ===
const organizationUserForm = $("organization_user_form");

organizationUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = $("id");
  const organization = $("organization");
  const img = $("img");
  const firstName = $("first_name");
  const lastName = $("last_name");
  const username = $("username");
  const password = $("password");
  const role = $("role");

  if (!id.value) id.value = null;

  const formData = new FormData();
  formData.append("id", id.value);
  formData.append("first_name", firstName.value);
  formData.append("last_name", lastName.value);
  formData.append("organization", organization.value);
  formData.append("role", role.value);
  formData.append("username", username.value);
  formData.append("password", password.value);

  if (img.files[0]) {
    formData.append("img", img.files[0]);
  }

  const url = organizationUserForm.action;
  const headers = csrfHeaders({ "Content-Type": "multipart/form-data" });

  const response = await call_shirkat(url, "POST", formData, headers);
  console.log("res", response);

  if ([200, 201].includes(response.status)) {
    if (response.data) {
      show_message("User Saved", "success");
      id.value = response.data.id;

      // redirect after 5 seconds
      setTimeout(() => {
        window.location.href = `/user/organization_user/add/${id.value}`;
      }, 5000);
    } else {
      show_message(response.data.message, "error");
    }
  } else {
    show_message("User Not Created", "error");
  }
});

// === Search & Pagination ===
async function search(url = "/user/organization_user/search/") {
  const data = { is_paginate: 1 };
  const organization = $("organization").value;
  const firstName = $("first_name").value;
  const lastName = $("last_name").value;
  const username = $("username").value;
  const searchInput = $("search_user_input");
  const searchTerm = searchInput ? searchInput.value : "";

  if (organization) data.organization = organization;
  
  // If search input has value, use it for all search fields
  if (searchTerm) {
    data.first_name = searchTerm;
    data.last_name = searchTerm;
    data.username = searchTerm;
  } else {
    // Otherwise use individual field values
    if (firstName) data.first_name = firstName;
    if (lastName) data.last_name = lastName;
    if (username) data.username = username;
  }

  const response = await call_shirkat(url, "POST", data, csrfHeaders());
  console.log("search res", response);

  if ([200, 201].includes(response.status) && response.data) {
    const { previous, next, results} =
      response.data;
    serializer_data=results['serializer_data']
    // if (serializer_data.length === 0) {
    //   return;
    // }

    const tbody = document.querySelector("#organization_user_body");
    const pagination = document.querySelector("#pagination_id");

    // clear table & pagination
    tbody.innerHTML = "";
    pagination.innerHTML = "";

    if (previous) {
      pagination.insertAdjacentHTML(
        "beforeend",
        `<a href="${previous}" class="btn-gradient" data-url="${previous}" onclick="handlePaginationClick(event); return false;">
          <i class="bi bi-arrow-left"></i> Previous
        </a>`
      );
    }

    if (next) {
      pagination.insertAdjacentHTML(
        "beforeend",
        `<a href="${next}" class="btn-gradient" data-url="${next}" onclick="handlePaginationClick(event); return false;">
          Next <i class="bi bi-arrow-right"></i>
        </a>`
      );
    }
    console.log("serializer_data", serializer_data);
    // render rows
    for (const user of serializer_data) {
      const row = `
        <tr>
          <td>${user.organization}</td>
          <td><i class="bi bi-person-circle"></i> ${user.username}</td>
          <td>${user.first_name}</td>
          <td>${user.last_name}</td>
          <td>
            <span class="badge bg-${getRoleBadgeColor(user.role)}">
              ${user.role}
            </span>
          </td>
          <td>
            <img src="${user.img || "/static/default.png"}" class="user-avatar" alt="${user.username}"/>
          </td>
          <td>
            <div class="action-buttons">
              <a href="/user/organization_user/add/${user.id}" class="btn-gradient" title="Update User">
                <i class="bi bi-pencil-square"></i> Update
              </a>
              <a class="btn-gradient btn-danger-gradient" onclick="deleteOrganizationUser(${user.id});return false" title="Delete User">
                <i class="bi bi-trash"></i> Delete
              </a>
            </div>
          </td>
        </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    }
  }
}

// Helper function to get badge color based on role
function getRoleBadgeColor(role) {
  const colors = {
    'employee': 'info',
    'admin': 'warning',
    'superuser': 'danger',
    'owner': 'success'
  };
  return colors[role] || 'secondary';
}

function handlePaginationClick(event) {
  event.preventDefault();
  const url = event.currentTarget.dataset.url;
  search(url);
}

// === Delete User ===
async function deleteOrganizationUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  const url = `/user/organization_user/delete/${id}`;
  const response = await call_shirkat(url, "DELETE", {}, csrfHeaders());

  console.log("delete res", response);

  if (response.status === 204) {
    show_message("User Deleted", "success");
    search();
  } else {
    show_message("User Not Deleted", "error");
  }
}

// Run initial search
search();
