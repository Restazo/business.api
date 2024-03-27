import { Response } from "express"

const sendResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
) => {
  let status: string

  switch (true) {
    case statusCode.toString().startsWith("2"):
      status = "success"
      break
    case statusCode.toString().startsWith("4"):
      status = "fail"
      break
    case statusCode.toString().startsWith("5"):
      status = "error"
      break
    default:
      status = "error"
  }

  res.status(statusCode).json({ status, message, data })
}

export default sendResponse
