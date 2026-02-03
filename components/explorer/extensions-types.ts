export interface Controller {
  controller_id: string
  controller_no: number
  device_id: string
  status: "online" | "offline"
  selectable: boolean
}
