{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}


{{- define "hostname" -}}
{{- if eq .Release.Namespace "prod" -}}
{{- .Values.ingress.baseHost -}}
{{- else -}}
{{- .Release.Namespace -}}.{{- .Values.ingress.baseHost -}}
{{- end -}}
{{- end -}}

{{- define "tls-secret" -}}
{{- include "hostname" . | replace "." "-" -}}-tls
{{- end -}}

{{- define "image.tag" -}}
{{- default .Chart.Version .Values.forceImageTag -}}
{{- end -}}
