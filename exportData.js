const API_ENDPOINT = "https://my-burger-api.herokuapp.com/burgers";

const messageSpan = document.querySelector(".message-output");
const buttons = document.querySelectorAll("button");

let message = "";

buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const dataType = e.target.dataset.type;
    fetchData(dataType);
  });
});

async function fetchData(type) {
  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error("Data not found - please try a valid url");
    }
    const data = await response.json();

    if (type === "excel") {
      const restaurantData = data.map(({ name, web }) => ({
        Name: name,
        Website: web,
      }));
      generateExcelFile(restaurantData);
    } else {
      const csvContent = data
        .map(({ name, web }) => `NAME: ${name}, WEBSITE: ${web}`)
        .join("\n");
      downloadCSV(csvContent, "burger_restaurants");
    }
    message = "Data downloaded successfully";
    messageSpan.textContent = message;
    setTimeout(() => {
      message = "";
      messageSpan.textContent = message;
    }, 2000);
  } catch (error) {
    console.error(error.message);
  }
}

//? GENERATE AND EXPORT EXCEL FORMAT
function generateExcelFile(data) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Burger Restaurants");

  saveFile(workbook, "xlsx", "burger_restaurants");
}

//? GENERATE AND EXPORT CSV FORMAT
function downloadCSV(content, fileName) {
  saveFile(content, "csv", fileName);
}

function saveFile(content, fileType, fileName) {
  const fileExtension =
    fileType === "csv" ? "text/csv;charset=utf-8;" : "application/octet-stream";
  const blob = new Blob([content], { type: fileExtension });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.${fileType}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
