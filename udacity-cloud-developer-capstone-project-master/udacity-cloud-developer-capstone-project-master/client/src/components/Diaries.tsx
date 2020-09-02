import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Form,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import {
  createDiary,
  deleteDiary,
  getDiaries,
  patchDiary,
  checkAttachmentURL
} from '../api/diaries-api'
import Auth from '../auth/Auth'
import { Diary } from '../types/Diary'
import Typist from 'react-typist'

interface DiariesProps {
  auth: Auth
  history: History
}

interface DiariesState {
  diaries: Diary[]
  newDiaryName: string
  loadingDiaries: boolean
}

export class Diaries extends React.PureComponent<DiariesProps, DiariesState> {
  state: DiariesState = {
    diaries: [],
    newDiaryName: '',
    loadingDiaries: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newDiaryName: event.target.value })
  }

  onEditButtonClick = (diaryId: string) => {
    this.props.history.push(`/diaries/${diaryId}/edit`)
  }

  onDiaryCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newDiary = await createDiary(this.props.auth.getIdToken(), {
        name: this.state.newDiaryName,
        dueDate
      })
      this.setState({
        diaries: [...this.state.diaries, newDiary],
        newDiaryName: ''
      })
    } catch {
      alert('Diary creation failed')
    }
  }

  onDiaryDelete = async (diaryId: string) => {
    try {
      await deleteDiary(this.props.auth.getIdToken(), diaryId)
      this.setState({
        diaries: this.state.diaries.filter((diary) => diary.diaryId != diaryId)
      })
    } catch {
      alert('Diary deletion failed')
    }
  }

  onDiaryCheck = async (pos: number) => {
    try {
      const diary = this.state.diaries[pos]
      await patchDiary(this.props.auth.getIdToken(), diary.diaryId, {
        name: diary.name,
        dueDate: diary.dueDate,
        done: !diary.done
      })
      this.setState({
        diaries: update(this.state.diaries, {
          [pos]: { done: { $set: !diary.done } }
        })
      })
    } catch {
      alert('Diary update failed')
    }
  }

  onCheckAttachmentURL = async (
    diary: Diary,
    pos: number
  ): Promise<boolean> => {
    try {
      const response = diary.attachmentUrl
        ? await checkAttachmentURL(diary.attachmentUrl)
        : false

      this.setState({
        diaries: update(this.state.diaries, {
          [pos]: { validUrl: { $set: response } }
        })
      })

      return true
    } catch {
      return false
    }
  }

  async componentDidMount() {
    try {
      const diaries = await getDiaries(this.props.auth.getIdToken())

      this.setState({
        diaries,
        loadingDiaries: false
      })

      this.state.diaries.map(async (diary, pos) => {
        diary['validUrl'] = diary.attachmentUrl
          ? await this.onCheckAttachmentURL(diary, pos)
          : false

        return diary
      })
    } catch (e) {
      alert(`Failed to fetch diaries: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Typist>
          <Header as="h1">Your Thoughts...</Header>
        </Typist>
        {this.renderCreateDiaryInput()}

        {this.renderDiaries()}
      </div>
    )
  }

  renderCreateDiaryInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Diary Entry',
              onClick: this.onDiaryCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Dear diary..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderDiaries() {
    if (this.state.loadingDiaries) {
      return this.renderLoading()
    }

    return this.renderDiariesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading your thoughts...
        </Loader>
      </Grid.Row>
    )
  }

  renderDiariesList() {
    return (
      <Grid padded>
        {this.state.diaries.map((diary, pos) => {
          return (
            <Grid.Row key={diary.diaryId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onDiaryCheck(pos)}
                  checked={diary.done}
                />
              </Grid.Column>

              <Grid.Column width={10} verticalAlign="middle">
                {diary.name}
              </Grid.Column>

              <Grid.Column width={3} floated="right">
                {diary.dueDate}
              </Grid.Column>

              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(diary.diaryId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>

              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onDiaryDelete(diary.diaryId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>

              {diary.attachmentUrl && diary.validUrl ? (
                <Image
                  src={diary.attachmentUrl}
                  size="small"
                  wrapped
                  centered
                />
              ) : null}

              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate())
    return dateFormat(date, 'yyyy-mm-dd hh:mm:ss') as string
  }
}
