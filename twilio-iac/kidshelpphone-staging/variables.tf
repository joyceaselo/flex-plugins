variable "account_sid" {}
variable "serverless_url" {}
variable "datadog_app_id" {}
variable "datadog_access_token" {}

variable "local_os" {
  description = "The OS running the terraform script. The only value that currently changes behaviour from default is 'Windows'"
  type        = string
  default = "Linux"
}

variable "helpline" {
  default = "Kids Help Phone"
}

variable "short_helpline" {
  default = "CA"
}

variable "operating_info_key" {
  default = "ca"
}

variable "environment" {
  default = "Staging"
}

variable "short_environment" {
  default = "STG"
}

variable "definition_version" {
  description = "Key that determines which set of form definitions this helpline will use"
  type        = string
  default = "ca-v1"
}

variable multi_office {
  default = false
  type = bool
  description = "Sets the multipleOfficeSupport flag in Flex Service Configuration"
}

variable "feature_flags" {
  description = "A map of feature flags that need to be set for this helpline's flex plugin"
  type = map(bool)
  default = {
    "enable_fullstory_monitoring" = false
    "enable_upload_documents" = true
    "enable_previous_contacts" = true
    "enable_case_management" = true
    "enable_offline_contact" = true
    "enable_transfers" = true
    "enable_manual_pulling" = true
    "enable_csam_report" = false
    "enable_canned_responses" = true
    "enable_dual_write" = false
    "enable_save_insights" = true
    "enable_post_survey" = false
  }
}