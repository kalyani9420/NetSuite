<script type="text/javascript">
document.addEventListener("DOMContentLoaded", function () {
  // SB Details.
  const suiteletUrl = `https://8176363-sb1.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1566&deploy=1`;
  const btn =  document.getElementById("custpageworkflow25041") || document.getElementById("custpageworkflow24024") || document.getElementById("custpageworkflow24785") || document.getElementById("custpageworkflow24980")  || document.getElementById("custpageworkflow24455") || document.getElementById("custpageworkflow24727") || document.getElementById("custpageworkflow24656") || document.getElementById("custpageworkflow24611") || document.getElementById("custpageworkflow24507") || document.getElementById("custpageworkflow24066")   || document.getElementById("custpageworkflow9504") || document.getElementById("custpageworkflow8227") || document.getElementById("custpageworkflow9526") || document.getElementById("custpageworkflow9313") || document.getElementById("custpageworkflow9321") || document.getElementById("custpageworkflow9349") || document.getElementById("custpageworkflow9327") || document.getElementById("custpageworkflow9354") || document.getElementById("custpageworkflow9359") || document.getElementById("custpageworkflow9364")
  const urlParams = new URLSearchParams(window.location.search);
  const recId = urlParams.get("id");

  console.log("Values", suiteletUrl, btn, urlParams, recId);

  console.log("HTML field applied.");

  if (!btn) {
    console.log("Workflow button not found.");
    return;
  }

  // Clone the original button to simulate click later
  const originalClick = btn.onclick;
  // Clear default handler to prevent double call
  btn.onclick = null;

  btn.addEventListener("click", async function (e) {
    // Prevent NetSuite's default behavior
    e.preventDefault();

    let userInput = prompt("Please enter rejection reason : ");
    if (userInput && userInput.trim() !== "") {
      try {
        const urlData = `&custpage_recordid=${recId}&custpage_rejection_reason_from_ui=${encodeURIComponent(userInput)}`
        const response = await fetch(suiteletUrl + urlData, { method: "GET" });
        if (!response.ok) {
          console.error(`Suitelet failed with status ${response.status}`);
          return;
        }
        console.log("Suitelet succeeded. Proceeding with rejection...");
        originalClick ? originalClick.call(btn) : btn.click();
      } catch (error) {
        console.error("Suitelet error:", error);
      }
    } else alert("A valid rejection reason is required!");
  });
});
</script>