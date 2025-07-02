const fs = require("fs")
const https = require("https")
const path = require("path")

const url = "https://uxcanvas.ai/api/projects/300ccbb5-5157-4041-b7df-4cb9ecbd2fed/25/code/EnergyFlow"

https
  .get(url, (res) => {
    let data = ""
    res.on("data", (chunk) => {
      data += chunk
    })
    res.on("end", () => {
      const filePath = "src/components/EnergyFlow/index.tsx"
      const dir = path.dirname(filePath)

      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(filePath, data)
      console.log("EnergyFlow component fetched successfully")
    })
  })
  .on("error", (err) => {
    console.log("Error fetching EnergyFlow:", err.message)
  })
