terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.11.1"
    }
  }
}

resource "twilio_flex_flex_flows_v1" "messaging_flow" {
  channel_type  = "sms"
  chat_service_sid = var.flex_chat_service_sid
  friendly_name = "Flex Messaging Channel Flow"
  integration_type = "studio"
  integration_flow_sid = var.messaging_studio_flow_sid
}
resource "twilio_flex_flex_flows_v1" "webchat_flow" {
  channel_type  = "web"
  chat_service_sid = var.flex_chat_service_sid
  friendly_name = "Flex Web Channel Flow"
  integration_type = "studio"
  integration_flow_sid = var.messaging_studio_flow_sid
}
